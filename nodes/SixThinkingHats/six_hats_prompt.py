import sys
import json
import logging
import os
from anthropic import Anthropic
from hat_handlers import HatHandler

# Настройка путей
current_dir = os.path.dirname(os.path.abspath(__file__))
log_file = os.path.join(current_dir, 'six_hats.log')

print(f"Текущая директория: {current_dir}")
print(f"Путь к файлу логов: {log_file}")

# Настройка логирования
try:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file)
        ]
    )
    print("Логирование настроено успешно")
except Exception as e:
    print(f"Ошибка при настройке логирования: {str(e)}")
    sys.exit(1)

logger = logging.getLogger(__name__)

def print_dialogue_header(topic):
    """Печатает заголовок диалога"""
    separator = "=" * 70
    print(f"\n{separator}")
    print(f"🎯 АНАЛИЗ ТЕМЫ: {topic}")
    print(f"{separator}\n")

def main():
    try:
        logger.info("Запуск обработки шести шляп мышления")
        print("Запуск обработки шести шляп мышления")

        if len(sys.argv) != 4:
            error_msg = "Неверное количество аргументов"
            logger.error(error_msg)
            print(json.dumps({"error": error_msg}))
            sys.exit(1)

        topic = sys.argv[1]
        selected_hats = json.loads(sys.argv[2])
        api_key = sys.argv[3]

        print(f"Тема: {topic}")
        print(f"Выбранные шляпы: {selected_hats}")
        logger.info(f"Получены параметры: тема='{topic}', шляпы={selected_hats}")

        if not api_key:
            error_msg = "API ключ Anthropic не предоставлен"
            logger.error(error_msg)
            print(json.dumps({"error": error_msg}))
            sys.exit(1)

        # Инициализация Anthropic
        logger.info("Инициализация Anthropic")
        print("Инициализация Anthropic клиента")
        client = Anthropic(api_key=api_key)
        handler = HatHandler(client)

        # Печатаем заголовок диалога
        print_dialogue_header(topic)

        results = {}
        all_formatted_outputs = []

        for hat in selected_hats:
            print(f"Обработка шляпы: {hat}")
            logger.info(f"Обработка шляпы: {hat}")
            result = handler.process_hat(hat, topic)
            results[hat] = result
            if 'formatted_output' in result:
                all_formatted_outputs.append(result['formatted_output'])

        # Печатаем итоговый разделитель
        print("\n" + "=" * 70 + "\n")

        logger.info("Обработка завершена успешно")
        print("Обработка завершена успешно")

        # Подготавливаем результаты для n8n
        n8n_results = {hat: {
            'analysis': results[hat]['analysis'],
            'hat_color': hat
        } for hat in selected_hats if 'analysis' in results[hat]}

        print(json.dumps(n8n_results, ensure_ascii=False))
        logger.info(f"Результаты: {json.dumps(n8n_results, ensure_ascii=False)}")

    except Exception as e:
        error_msg = f"Произошла ошибка: {str(e)}"
        logger.error(error_msg, exc_info=True)
        print(json.dumps({"error": error_msg}))
        sys.exit(1)

if __name__ == "__main__":
    main()