import json
import ollama

from agent.model import MODEL_NAME
from agent.prompt import AQUASENTINEL_SYSTEM_PROMPT
from agent.tool_registry import TOOL_REGISTRY

from tools.get_active_incidents import get_active_incidents
from tools.investigate_incident import investigate_incident
from tools.find_nearby_infrastructure import find_nearby_infrastructure
from tools.get_available_resources import get_available_resources
from tools.assess_and_prioritize_incident import assess_and_prioritize_incident
from tools.find_nearby_hotspots import find_nearby_hotspots
from tools.allocate_resources import allocate_resources

from database.session import SessionLocal


# Maps the tool name provided to the LLM to the actual Python function.
TOOL_FUNCTIONS = {
    "get_active_incidents": get_active_incidents,
    "investigate_incident": investigate_incident,
    "find_nearby_infrastructure": find_nearby_infrastructure,
    "get_available_resources": get_available_resources,
    "assess_and_prioritize_incident": assess_and_prioritize_incident,
    "find_nearby_hotspots": find_nearby_hotspots,
    "allocate_resources": allocate_resources,
}


class AquaSentinelAgent:
    """
    Main agent loop for AquaSentinel.

    Responsibilities:
    1. Send messages and tool definitions to Ollama.
    2. Detect tool calls requested by the LLM.
    3. Execute the requested Python tools.
    4. Return tool results to the LLM.
    5. Continue until the LLM produces a final response.
    """

    def __init__(self):
        self.model = MODEL_NAME

    def run(self, user_message: str):
        """
        Run the AquaSentinel agent for a given user/application request.
        """

        messages = [
            {
                "role": "system",
                "content": AQUASENTINEL_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": user_message,
            },
        ]

        while True:

            response = ollama.chat(
                model=self.model,
                messages=messages,
                tools=TOOL_REGISTRY,
                think=True,
            )

            assistant_message = response["message"]

            # Show model's thinking
            thinking = assistant_message.get("thinking", "")

            if thinking:
                print("\n[Agent Thinking]")
                print(thinking)

            # Add the assistant's response to the conversation.
            messages.append(assistant_message)

            # Check whether the LLM requested any tools

            tool_calls = assistant_message.get("tool_calls", [])

            # No tool calls means the LLM has finished reasoning
            # and has produced its final response.
            if not tool_calls:
                return assistant_message.get("content", "")

            # Execute each requested tool

            for tool_call in tool_calls:

                function = tool_call["function"]

                tool_name = function["name"]
                arguments = function.get("arguments", {})

                print(f"\n[Agent] Calling tool: {tool_name}")
                print(f"[Agent] Arguments: {arguments}")

                # Find the corresponding Python function

                tool_function = TOOL_FUNCTIONS.get(tool_name)

                if tool_function is None:

                    tool_result = {
                        "error": f"Unknown tool: {tool_name}"
                    }

                else:

                    try:

                        db = SessionLocal()

                        try:
                            result = tool_function(
                                db=db,
                                **arguments
                            )

                            tool_result = result

                        finally:
                            db.close()

                    except Exception as e:

                        tool_result = {
                            "error": str(e)
                        }

                print(f"[Agent] Tool result: {tool_result}")

                # Return the tool result to the LLM

                messages.append(
                    {
                        "role": "tool",
                        "content": json.dumps(
                            tool_result,
                            default=str
                        ),
                    }
                )