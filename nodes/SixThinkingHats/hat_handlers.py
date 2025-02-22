from datetime import datetime
from typing import Dict, List, Optional
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class HatHandler(ABC):
    def __init__(self, name: str, color: str):
        self.name = name
        self.color = color
        self.messages: List[Dict] = []
        self.previous_responses: List[Dict] = []

    def add_message(self, content: str, response_to: Optional[str] = None) -> None:
        """
        Adds a message to the hat's conversation history
        Args:
            content: The message content
            response_to: ID of the message this is responding to
        """
        message = {
            'id': f"{self.color}_{len(self.messages)}",
            'hat': self.color,
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'response_to': response_to
        }
        self.messages.append(message)
        logger.info(f"{self.color} hat added message: {message['id']}")

    def get_history(self) -> List[Dict]:
        """
        Returns the hat's message history
        """
        return self.messages

    def get_context_for_response(self) -> str:
        """
        Gets context from previous messages for generating responses
        """
        context = []
        for msg in self.messages[-3:]:  # Last 3 messages for context
            context.append(f"{msg['hat'].upper()} hat: {msg['content']}")
        return "\n".join(context)

    @abstractmethod
    def get_prompt_context(self) -> str:
        """
        Returns the prompt context for this hat type
        Must be implemented by each hat class
        """
        pass

class BlueHat(HatHandler):
    def __init__(self):
        super().__init__('Process Control', 'blue')

    def get_prompt_context(self) -> str:
        return """
        As the Blue hat (Process Controller), your role is to:
        1. Manage and guide the thinking process
        2. Define clear objectives and keep focus
        3. Observe and analyze contributions from other hats
        4. Request specific input from other hats when needed
        5. Summarize insights and redirect discussion if needed
        6. Ensure productive and balanced dialogue
        7. Make final conclusions and action plans

        Always maintain control of the discussion flow and 
        redirect when the conversation strays from the objective.
        """

class WhiteHat(HatHandler):
    def __init__(self):
        super().__init__('Facts', 'white')

    def get_prompt_context(self) -> str:
        return """
        As the White hat, focus on:
        1. Present verified facts and data objectively
        2. Identify gaps in information
        3. Suggest ways to obtain missing data
        4. Respond to Blue hat's requests for factual clarity
        5. Avoid interpretations or opinions

        Maintain neutrality and factual accuracy in all responses.
        Support other hats with relevant data when requested.
        """

class RedHat(HatHandler):
    def __init__(self):
        super().__init__('Emotions', 'red')

    def get_prompt_context(self) -> str:
        return """
        As the Red hat, express:
        1. Immediate feelings and reactions
        2. Emotional insights and intuitions
        3. Changes in emotional response over discussion
        4. Gut feelings about proposed ideas
        5. Respond to emotional aspects highlighted by others

        Share authentic emotional responses while respecting
        the Blue hat's guidance and other perspectives.
        """

class BlackHat(HatHandler):
    def __init__(self):
        super().__init__('Caution', 'black')

    def get_prompt_context(self) -> str:
        return """
        As the Black hat, identify:
        1. Potential risks and weaknesses
        2. Logical flaws in proposals
        3. Specific concerns needing attention
        4. Constructive criticism of ideas
        5. Respond to others' optimism with careful analysis

        Provide balanced caution while remaining open to solutions
        and following the Blue hat's guidance.
        """

class YellowHat(HatHandler):
    def __init__(self):
        super().__init__('Benefits', 'yellow')

    def get_prompt_context(self) -> str:
        return """
        As the Yellow hat, explore:
        1. Identify opportunities and benefits
        2. Find value in other hats' concerns
        3. Suggest constructive possibilities
        4. Build on positive aspects discussed
        5. Balance Black hat's caution with optimism

        Maintain realistic optimism while acknowledging
        valid concerns raised by others.
        """

class GreenHat(HatHandler):
    def __init__(self):
        super().__init__('Creativity', 'green')

    def get_prompt_context(self) -> str:
        return """
        As the Green hat, generate:
        1. Novel solutions and approaches
        2. Creative responses to challenges
        3. Alternative perspectives
        4. Innovative combinations of ideas
        5. Build on others' contributions creatively

        Focus on generating new possibilities while
        respecting the Blue hat's process direction.
        """

class HatManager:
    def __init__(self):
        self.hats = {
            'blue': BlueHat(),
            'white': WhiteHat(),
            'red': RedHat(),
            'black': BlackHat(),
            'yellow': YellowHat(),
            'green': GreenHat()
        }

    def get_hat(self, color: str) -> Optional[HatHandler]:
        """
        Returns the handler for a specific hat color
        """
        return self.hats.get(color)

    def get_dialogue_history(self) -> List[Dict]:
        """
        Returns the complete dialogue history across all hats
        """
        history = []
        for hat in self.hats.values():
            history.extend(hat.get_history())
        return sorted(history, key=lambda x: x['timestamp'])

    def get_blue_hat_summary(self) -> str:
        """
        Gets the latest summary from the Blue hat
        """
        blue_hat = self.hats['blue']
        if blue_hat.messages:
            return blue_hat.messages[-1]['content']
        return "No summary available yet."