import os
import sys
import json
import logging
import argparse
import asyncio
from datetime import datetime
from typing import List, Dict, Optional
from anthropic import Anthropic
from console_formatter import ConsoleFormatter
from hat_handlers import HatManager

# Configure logging
logging.basicConfig(
    filename='six_hats.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SixHatsAnalyzer:
    def __init__(self):
        self.api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

        self.client = Anthropic(api_key=self.api_key)
        self.hat_manager = HatManager()
        self.console = ConsoleFormatter()
        self.current_topic: Optional[str] = None

    async def analyze_topic(self, topic: str, hats_order: List[str], dialog_mode: bool) -> Dict:
        try:
            self.current_topic = topic
            logger.info(f"Starting analysis for topic: {topic}")
            self.console.print_header(f"Analyzing: {topic}")

            current_focus = topic
            for hat_color in hats_order:
                hat_handler = self.hat_manager.get_hat(hat_color)
                if not hat_handler:
                    raise ValueError(f"Invalid hat color: {hat_color}")

                self.console.print_hat_transition(hat_color)

                # Get context from previous messages if in dialog mode
                context = hat_handler.get_context_for_response() if dialog_mode else ""

                # Special handling for Blue hat
                if hat_color == 'blue':
                    if len(self.hat_manager.get_dialogue_history()) > 0:
                        # Update focus based on discussion
                        current_focus = await self._get_blue_hat_focus(topic)

                response = await self.process_hat_thinking(
                    hat_color, 
                    current_focus, 
                    dialog_mode,
                    context
                )

                # Add message to history with proper context
                last_message = self.hat_manager.get_dialogue_history()[-1] if self.hat_manager.get_dialogue_history() else None
                response_to = last_message['id'] if last_message and dialog_mode else None
                hat_handler.add_message(response, response_to)

                # Print message with context
                self.console.print_message(hat_handler.messages[-1])

                # If it's the Blue hat, show summary after other hats have spoken
                if hat_color == 'blue' and len(self.hat_manager.get_dialogue_history()) > 1:
                    self.console.print_blue_hat_summary(response)

            # Show final dialogue summary
            self.console.print_dialogue_summary(self.hat_manager.get_dialogue_history())

            return {
                'status': 'success',
                'conversation': self.hat_manager.get_dialogue_history()
            }

        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'conversation': self.hat_manager.get_dialogue_history()
            }

    async def process_hat_thinking(
        self, 
        hat_color: str, 
        topic: str, 
        dialog_mode: bool,
        context: str = ""
    ) -> str:
        try:
            prompt_context = self._build_context(hat_color, dialog_mode, context)

            response = await self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": f"{prompt_context}\n\nTopic: {topic}\n\nPrevious discussion: {context}"
                }]
            )

            return response.content[0].text

        except Exception as e:
            logger.error(f"Error processing hat {hat_color}: {str(e)}")
            raise

    async def _get_blue_hat_focus(self, original_topic: str) -> str:
        """
        Have the Blue hat analyze the discussion and determine the next focus
        """
        try:
            history = self.hat_manager.get_dialogue_history()
            history_context = "\n".join([
                f"{msg['hat'].upper()} hat: {msg['content']}"
                for msg in history[-3:]  # Last 3 messages for context
            ])

            response = await self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": f"""
                    As the Blue hat, analyze the recent discussion about '{original_topic}':

                    {history_context}

                    What should be the next focus of discussion? 
                    Respond with a clear, concise direction that addresses the most pressing aspects 
                    revealed in the dialogue so far.
                    """
                }]
            )

            return response.content[0].text

        except Exception as e:
            logger.error(f"Error getting Blue hat focus: {str(e)}")
            return original_topic

    def _build_context(self, hat_color: str, dialog_mode: bool, context: str = "") -> str:
        hat = self.hat_manager.get_hat(hat_color)
        base_context = hat.get_prompt_context()

        if dialog_mode:
            base_context += f"\n\nConsider the previous discussion:\n{context}"
            if hat_color == 'blue':
                base_context += "\nAs the Blue hat, guide the discussion and maintain focus."

        return base_context

async def async_main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--topic', required=True)
    parser.add_argument('--hats', required=True)
    parser.add_argument('--dialog-mode', required=True)

    args = parser.parse_args()
    hats_order = json.loads(args.hats)
    dialog_mode = args.dialog_mode.lower() == 'true'

    analyzer = SixHatsAnalyzer()
    result = await analyzer.analyze_topic(args.topic, hats_order, dialog_mode)

    print(json.dumps(result))

def main():
    asyncio.run(async_main())

if __name__ == "__main__":
    main()