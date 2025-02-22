from typing import List, Dict
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich.layout import Layout
from rich.tree import Tree
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from datetime import datetime
from collections import Counter

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
        self.hat_emoji = {
            'blue': '🎩',
            'white': '👒',
            'red': '🧢',
            'black': '🎓',
            'yellow': '⛑️',
            'green': '🪖'
        }
        self.progress = Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TimeElapsedColumn(),
        )

    def print_header(self, topic: str) -> None:
        """
        Prints the analysis header with the topic
        """
        self.console.print(Panel(
            Text(f"Six Thinking Hats Analysis: {topic}", style="bold white"),
            border_style="blue",
            title="🎩 Analysis Session",
            subtitle=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

    def print_hat_transition(self, hat_color: str) -> None:
        """
        Prints a transition message when switching hats
        """
        color = self.hat_colors.get(hat_color, 'white')
        emoji = self.hat_emoji.get(hat_color, '🎩')
        self.console.print(
            Panel(
                Text(f"Switching to {hat_color.upper()} hat {emoji}", style=f"bold {color}"),
                border_style=color,
                title="Hat Transition"
            )
        )

    def print_message(self, message: Dict) -> None:
        """
        Prints a message from a specific hat with context
        """
        hat_color = message['hat']
        content = message['content']
        response_to = message.get('response_to')
        emoji = self.hat_emoji.get(hat_color, '🎩')
        color = self.hat_colors.get(hat_color, 'white')

        # Create a nested layout for the message
        message_layout = Layout()

        # Add response context if this is a reply
        if response_to:
            message_layout.add(
                Panel(
                    Text(f"Responding to: {response_to}", style="dim"),
                    border_style="dim",
                    padding=(0, 2)
                )
            )

        # Add the main message
        message_layout.add(
            Panel(
                Text(content, style=color),
                title=f"{emoji} {hat_color.upper()} Hat",
                title_align="left",
                border_style=color,
                subtitle=f"Message ID: {message['id']} | {datetime.fromisoformat(message['timestamp']).strftime('%H:%M:%S')}"
            )
        )

        self.console.print(message_layout)

    def print_dialogue_tree(self, conversation_history: List[Dict]) -> None:
        """
        Prints the dialogue as a tree structure
        """
        tree = Tree("🎭 Dialogue Flow")

        # Create message lookup for faster access
        message_lookup = {msg['id']: msg for msg in conversation_history}

        # Find root messages (no response_to)
        root_messages = [msg for msg in conversation_history if not msg.get('response_to')]

        for root_msg in root_messages:
            self._add_message_to_tree(tree, root_msg, message_lookup, conversation_history)

        self.console.print(tree)

    def _add_message_to_tree(self, parent: Tree, message: Dict, lookup: Dict, all_messages: List[Dict]) -> None:
        """
        Recursively adds messages to the tree
        """
        color = self.hat_colors.get(message['hat'], 'white')
        emoji = self.hat_emoji.get(message['hat'], '🎩')

        # Create node label
        time = datetime.fromisoformat(message['timestamp']).strftime("%H:%M:%S")
        content_preview = message['content'][:50] + "..." if len(message['content']) > 50 else message['content']
        label = f"{emoji} [{color}]{message['hat'].upper()}[/] ({time}): {content_preview}"

        # Add node to tree
        node = parent.add(label)

        # Find and add replies
        replies = [msg for msg in all_messages if msg.get('response_to') == message['id']]
        for reply in replies:
            self._add_message_to_tree(node, reply, lookup, all_messages)

    def print_analysis_statistics(self, conversation_history: List[Dict]) -> None:
        """
        Prints statistics about the dialogue
        """
        # Count messages per hat
        hat_counts = Counter(msg['hat'] for msg in conversation_history)

        # Calculate response times
        response_times = []
        for msg in conversation_history:
            if msg.get('response_to'):
                response_to = next((m for m in conversation_history if m['id'] == msg['response_to']), None)
                if response_to:
                    time_diff = (datetime.fromisoformat(msg['timestamp']) - 
                               datetime.fromisoformat(response_to['timestamp'])).total_seconds()
                    response_times.append(time_diff)

        # Create statistics table
        table = Table(
            title="Analysis Statistics",
            show_header=True,
            header_style="bold magenta"
        )

        table.add_column("Hat", style="bold")
        table.add_column("Messages", justify="right")
        table.add_column("Participation", justify="right")

        total_messages = len(conversation_history)
        for hat, count in hat_counts.items():
            emoji = self.hat_emoji.get(hat, '🎩')
            percentage = (count / total_messages) * 100
            table.add_row(
                f"{emoji} {hat.upper()}",
                str(count),
                f"{percentage:.1f}%"
            )

        self.console.print(table)

    def create_progress_tracker(self, total_steps: int) -> None:
        """
        Creates a progress tracker for the analysis process
        """
        self.progress.start()
        return self.progress.add_task("Analyzing...", total=total_steps)

    def update_progress(self, task_id: int, advance: int = 1) -> None:
        """
        Updates the progress tracker
        """
        self.progress.update(task_id, advance=advance)

    def complete_progress(self) -> None:
        """
        Completes and removes the progress tracker
        """
        self.progress.stop()

    def print_blue_hat_summary(self, summary: str) -> None:
        """
        Prints the Blue hat's summary of the discussion
        """
        self.console.print(
            Panel(
                Text(summary, style="bold blue"),
                title="🎩 Blue Hat Summary",
                border_style="blue",
                title_align="center",
                subtitle=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
        )

    def print_error(self, error_message: str) -> None:
        """
        Prints an error message
        """
        self.console.print(
            Panel(
                Text(f"Error: {error_message}", style="bold red"),
                border_style="red",
                title="❌ Error"
            )
        )

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