import sys
import json
from langchain import OpenAI
from langchain.prompts import PromptTemplate
from hat_handlers import HatHandler

def main():
    if len(sys.argv) != 4:
        print("Error: Incorrect number of arguments")
        sys.exit(1)

    topic = sys.argv[1]
    selected_hats = json.loads(sys.argv[2])
    api_key = sys.argv[3]

    # Initialize LangChain
    llm = OpenAI(temperature=0.7, openai_api_key=api_key)
    handler = HatHandler(llm)

    results = {}
    
    for hat in selected_hats:
        results[hat] = handler.process_hat(hat, topic)

    print(json.dumps(results))

if __name__ == "__main__":
    main()
