def run(inputs):
    data = inputs["data"]
    return {"data": [x * 2 for x in data]}