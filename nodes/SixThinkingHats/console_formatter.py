from typing import List, Dict
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich.layout import Layout
from datetime import datetime

class ConsoleFormatter:
    def __init__(self):
        self.console = Console()
        self.hat_colors = {
            'blue': '#0000FF',
            'white': '#FFFFFF',
            'red': '#FF0000',
            'black': '#000000',
            'yellow': '#FFFF00',
            'green': '#00FF00'
        }

    def print_header(self, topic: str) -> None:
        """
        Prints the analysis header with the topic
        """
        self.console.print(Panel(
            Text(f"Six Thinking Hats Analysis: {topic}", style="bold white"),
            border_style="blue"
        ))

    def print_hat_transition(self, hat_color: str) -> None:
        """
        Prints a transition message when switching hats
        """
        color = self.hat_colors.get(hat_color, 'white')
        self.console.print(
            Panel(
                Text(f"Switching to {hat_color.upper()} hat", style=f"bold {color}"),
                border_style=color
            )
        )

    def print_message(self, message: Dict) -> None:
        """
        Prints a message from a specific hat with context
        """
        hat_color = message['hat']
        content = message['content']
        response_to = message.get('response_to')

        color = self.hat_colors.get(hat_color, 'white')

        # Create a nested layout for the message
        message_layout = Layout()

        # Add response context if this is a reply
        if response_to:
            message_layout.add(
                Panel(
                    Text(f"Responding to: {response_to}", style="dim"),
                    border_style="dim"
                )
            )

        # Add the main message
        message_layout.add(
            Panel(
                Text(content, style=color),
                title=f"{hat_color.upper()} Hat",
                title_align="left",
                border_style=color,
                subtitle=datetime.fromisoformat(message['timestamp']).strftime("%H:%M:%S")
            )
        )

        self.console.print(message_layout)

    def print_dialogue_summary(self, conversation_history: List[Dict]) -> None:
        """
        Prints an interactive summary of the dialogue
        """
        table = Table(
            title="Dialogue Summary",
            show_header=True,
            header_style="bold white"
        )

        table.add_column("Time", style="dim")
        table.add_column("Hat", style="bold")
        table.add_column("Message", style="white")
        table.add_column("Response To", style="dim")

        for message in conversation_history:
            time = datetime.fromisoformat(message['timestamp']).strftime("%H:%M:%S")
            hat = message['hat'].upper()
            content = message['content'][:50] + "..." if len(message['content']) > 50 else message['content']
            response_to = message.get('response_to', '-')

            table.add_row(
                time,
                hat,
                content,
                response_to
            )

        self.console.print(table)

    def print_error(self, error_message: str) -> None:
        """
        Prints an error message
        """
        self.console.print(
            Panel(
                Text(f"Error: {error_message}", style="bold red"),
                border_style="red"
            )
        )

    def print_blue_hat_summary(self, summary: str) -> None:
        """
        Prints the Blue hat's summary of the discussion
        """
        self.console.print(
            Panel(
                Text(summary, style="bold blue"),
                title="Blue Hat Summary",
                border_style="blue",
                title_align="center"
            )
        )