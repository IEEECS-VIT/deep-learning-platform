def run(inputs):
    data = inputs["data"]
    return {"accuracy": sum(data) / len(data)}