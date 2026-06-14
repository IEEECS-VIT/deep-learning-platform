import modal

app = modal.App("deep-learning-platform")

image = (modal.Image.debian_slim().pip_install("torch", "torchvision", "scikit-learn", "numpy").add_local_python_source("modal_service"))

@app.function(image=image, cpu=2)
def train_mlp(input_data, config):
    from modal_service.trainers.mlp_trainer import train
    return train(input_data,config)

@app.function(image=image, cpu=2)
def train_cnn(input_data, config):
    print("CNN STARTED")
    print(input_data.keys())
    print(config)

    from modal_service.trainers.cnn_trainer import train

    result = train(input_data, config)

    print("CNN FINISHED")

    return result

@app.function()
def hello():
    return "Modal is working"