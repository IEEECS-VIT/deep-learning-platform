import modal

app = modal.App("deep-learning-platform")

image = (modal.Image.debian_slim().pip_install("torch", "torchvision", "scikit-learn", "numpy").add_local_python_source("modal_service"))

@app.function(image=image, cpu=2)
def train_mlp(input_data, config):
    from modal_service.trainers.mlp_trainer import train
    return train(input_data,config)

@app.function(image=image, cpu=2)
def train_cnn(input_data, config):
    from modal_service.trainers.cnn_trainer import train
    result = train(input_data, config)
    return result

@app.function(image=image)
def load_mnist(max_samples=2000):
    from torchvision import datasets
    dataset = datasets.MNIST(root="data",  train=True, download=True)
    X = dataset.data[:max_samples].tolist()
    y = dataset.targets[:max_samples].tolist()
    return {
        "X": X,
        "y": y,
        "dataset_name": "mnist",
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 1,
        "image_height": 28,
        "image_width": 28
    }


@app.function(image=image)
def load_fashion_mnist(max_samples=2000):
    from torchvision import datasets
    dataset = datasets.FashionMNIST(root="data",  train=True, download=True)
    X = dataset.data[:max_samples].tolist()
    y = dataset.targets[:max_samples].tolist()
    return {
        "X": X,
        "y": y,
        "dataset_name": "fashion_mnist",
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 1,
        "image_height": 28,
        "image_width": 28
    }


@app.function(image=image)
def load_cifar10(max_samples=2000):
    from torchvision import datasets
    dataset = datasets.CIFAR10(root="data", train=True,  download=True)
    X = dataset.data[:max_samples].tolist()
    y = dataset.targets[:max_samples].tolist()
    return {
        "X": X,
        "y": y,
        "dataset_name": "cifar10",
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 3,
        "image_height": 32,
        "image_width": 32
    }

@app.function()
def hello():
    return "Modal is working"