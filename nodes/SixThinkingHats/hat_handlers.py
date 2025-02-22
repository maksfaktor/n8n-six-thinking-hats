from langchain.prompts import PromptTemplate

class HatHandler:
    def __init__(self, llm):
        self.llm = llm
        self.hat_prompts = {
            'white': """
                Analyze the following topic from a White Hat perspective (facts and information only):
                Topic: {topic}
                Focus on:
                - Available data and facts
                - Objective information
                - Gaps in knowledge
                Please provide a structured analysis of the facts.
            """,
            'red': """
                Consider the following topic from a Red Hat perspective (emotions and feelings):
                Topic: {topic}
                Focus on:
                - Emotional reactions
                - Intuitive responses
                - Gut feelings
                Share the emotional perspective without justification.
            """,
            'black': """
                Evaluate the following topic from a Black Hat perspective (critical judgment):
                Topic: {topic}
                Focus on:
                - Potential risks
                - Logical flaws
                - Weaknesses
                Provide a careful critical analysis.
            """,
            'yellow': """
                Examine the following topic from a Yellow Hat perspective (benefits and positivity):
                Topic: {topic}
                Focus on:
                - Opportunities
                - Benefits
                - Positive aspects
                List the constructive points and potential advantages.
            """,
            'green': """
                Consider the following topic from a Green Hat perspective (creativity):
                Topic: {topic}
                Focus on:
                - New ideas
                - Alternative approaches
                - Innovative solutions
                Generate creative possibilities and alternatives.
            """,
            'blue': """
                Organize thoughts about the following topic from a Blue Hat perspective (process control):
                Topic: {topic}
                Focus on:
                - Overview of thinking process
                - Next steps
                - Action items
                Provide a structured summary and action plan.
            """
        }

    def process_hat(self, hat_color, topic):
        if hat_color not in self.hat_prompts:
            return {"error": f"Invalid hat color: {hat_color}"}

        prompt = PromptTemplate(
            input_variables=["topic"],
            template=self.hat_prompts[hat_color]
        )
        
        formatted_prompt = prompt.format(topic=topic)
        response = self.llm(formatted_prompt)
        
        return {
            "analysis": response.strip(),
            "hat_color": hat_color
        }
