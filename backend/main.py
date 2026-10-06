from agent.agent import AquaSentinelAgent


def main():
    agent = AquaSentinelAgent()

    result = agent.run(
        "Check the current waterlogging situation and determine "
        "whether any active incident requires a response."
    )

    print("\n========== AQUASENTINEL RESPONSE ==========\n")
    print(result)


if __name__ == "__main__":
    main()