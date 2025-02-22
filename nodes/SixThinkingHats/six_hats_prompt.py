import sys
import json
import logging
from anthropic import Anthropic
from hat_handlers import HatHandler

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    try:
        logger.info("Запуск обработки шести шляп мышления")

        if len(sys.argv) != 4:
            logger.error("Неверное количество аргументов")
            print(json.dumps({"error": "Необходимо указать тему, выбранные шляпы и API ключ"}))
            sys.exit(1)

        topic = sys.argv[1]
        selected_hats = json.loads(sys.argv[2])
        api_key = sys.argv[3]

        logger.info(f"Получены параметры: тема='{topic}', шляпы={selected_hats}")

        # Инициализация Anthropic
        logger.info("Инициализация Anthropic")
        # the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
        client = Anthropic(api_key=api_key)
        handler = HatHandler(client)

        results = {}

        for hat in selected_hats:
            logger.info(f"Обработка шляпы: {hat}")
            results[hat] = handler.process_hat(hat, topic)

        logger.info("Обработка завершена успешно")
        print(json.dumps(results))

    except Exception as e:
        logger.error(f"Произошла ошибка: {str(e)}", exc_info=True)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()