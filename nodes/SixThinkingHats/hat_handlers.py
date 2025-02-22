import logging

class HatHandler:
    def __init__(self, client):
        self.client = client
        self.hat_colors = {
            'white': '⚪',
            'red': '🔴',
            'black': '⚫',
            'yellow': '💛',
            'green': '💚',
            'blue': '💙'
        }
        self.hat_prompts = {
            'white': """
                Анализируйте следующую тему с позиции Белой шляпы (только факты и информация):
                Тема: {topic}
                Сосредоточьтесь на:
                - Доступных данных и фактах
                - Объективной информации
                - Пробелах в знаниях
                Пожалуйста, предоставьте структурированный анализ фактов.
            """,
            'red': """
                Рассмотрите следующую тему с позиции Красной шляпы (эмоции и чувства):
                Тема: {topic}
                Сосредоточьтесь на:
                - Эмоциональных реакциях
                - Интуитивных ответах
                - Внутренних ощущениях
                Поделитесь эмоциональной перспективой без обоснования.
            """,
            'black': """
                Оцените следующую тему с позиции Черной шляпы (критическое суждение):
                Тема: {topic}
                Сосредоточьтесь на:
                - Потенциальных рисках
                - Логических недостатках
                - Слабых местах
                Предоставьте тщательный критический анализ.
            """,
            'yellow': """
                Изучите следующую тему с позиции Желтой шляпы (преимущества и позитив):
                Тема: {topic}
                Сосредоточьтесь на:
                - Возможностях
                - Преимуществах
                - Позитивных аспектах
                Перечислите конструктивные моменты и потенциальные выгоды.
            """,
            'green': """
                Рассмотрите следующую тему с позиции Зеленой шляпы (креативность):
                Тема: {topic}
                Сосредоточьтесь на:
                - Новых идеях
                - Альтернативных подходах
                - Инновационных решениях
                Создайте творческие возможности и альтернативы.
            """,
            'blue': """
                Организуйте мысли о следующей теме с позиции Синей шляпы (контроль процесса):
                Тема: {topic}
                Сосредоточьтесь на:
                - Обзоре процесса мышления
                - Следующих шагах
                - Пунктах для действия
                Предоставьте структурированное резюме и план действий.
            """
        }

    def format_hat_output(self, hat_color, analysis):
        """Форматирует вывод для отдельной шляпы"""
        emoji = self.hat_colors.get(hat_color, '🎩')
        hat_name = hat_color.upper()
        separator = "=" * 50
        return f"""
{separator}
{emoji} {hat_name} ШЛЯПА {emoji}
{separator}
{analysis}
"""

    def process_hat(self, hat_color, topic):
        import logging
        logging.info(f"Начало обработки для шляпы {hat_color} и темы: {topic}")

        if hat_color not in self.hat_prompts:
            logging.error(f"Неверный цвет шляпы: {hat_color}")
            return {"error": f"Неверный цвет шляпы: {hat_color}"}

        prompt_template = self.hat_prompts[hat_color]
        formatted_prompt = prompt_template.format(topic=topic)

        logging.info("Отправка запроса к Anthropic API")
        try:
            # the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=[{"role": "user", "content": formatted_prompt}]
            )

            logging.info("Получен ответ от API")

            if not response.content:
                logging.error("Пустой ответ от API")
                return {"error": "Пустой ответ от API"}

            analysis = response.content[0].text.strip()
            formatted_output = self.format_hat_output(hat_color, analysis)
            print(formatted_output)  # Выводим форматированный текст в консоль

            logging.info(f"Анализ для шляпы {hat_color}: {analysis[:100]}...")

            return {
                "analysis": analysis,
                "hat_color": hat_color,
                "formatted_output": formatted_output
            }

        except Exception as e:
            logging.error(f"Ошибка при обработке шляпы {hat_color}: {str(e)}")
            return {"error": f"Ошибка при обработке: {str(e)}"}