import modal

app = modal.App("deep-learning-platform")

image = (
    modal.Image.debian_slim()
    .pip_install(
        "torch",
        "torchvision",
        "scikit-learn",
        "numpy"
    )
    .add_local_python_source("modal_service")
)


@app.function(image=image, cpu=2)
def train_mlp(input_data, config):
    from modal_service.trainers.mlp_trainer import train
    return train(input_data, config)


@app.function(image=image, cpu=2)
def train_cnn(input_data, config):
    from modal_service.trainers.cnn_trainer import train
    return train(input_data, config)


@app.function(image=image)
def load_mnist(max_samples=2000):
    from torchvision import datasets

    dataset = datasets.MNIST(
        root="data",
        train=True,
        download=True
    )

    return {
        "X": dataset.data[:max_samples].tolist(),
        "y": dataset.targets[:max_samples].tolist(),
        "dataset_name": "mnist",
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 1,
        "image_height": 28,
        "image_width": 28,
    }


@app.function(image=image)
def load_fashion_mnist(max_samples=2000):
    from torchvision import datasets

    dataset = datasets.FashionMNIST(
        root="data",
        train=True,
        download=True
    )

    return {
        "X": dataset.data[:max_samples].tolist(),
        "y": dataset.targets[:max_samples].tolist(),
        "dataset_name": "fashion_mnist",
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 1,
        "image_height": 28,
        "image_width": 28,
    }


@app.function(image=image)
def load_cifar10(max_samples=2000):
    from torchvision import datasets

    dataset = datasets.CIFAR10(
        root="data",
        train=True,
        download=True
    )

    targets = dataset.targets[:max_samples]
    if hasattr(targets, 'tolist'):
        targets = targets.tolist()
    else:
        targets = list(targets)

    return {
        "X": dataset.data[:max_samples].tolist(),
        "y": targets,
        "dataset_name": "cifar10",
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 3,
        "image_height": 32,
        "image_width": 32,
    }

@app.function(image=image, cpu=2)
def split_and_train_mlp(dataset_name, max_samples, split_config, train_config):
    import numpy as np
    from sklearn.model_selection import train_test_split as tts

    # Load dataset inside Modal — never sent to backend
    if dataset_name == "mnist":
        from torchvision import datasets as tvd
        ds = tvd.MNIST(root="data", train=True, download=True)
        X = np.array(ds.data[:max_samples])
        y = np.array(ds.targets[:max_samples])
        meta = {"data_format": "image", "image_channels": 1, "image_height": 28, "image_width": 28}
    elif dataset_name == "fashion_mnist":
        from torchvision import datasets as tvd
        ds = tvd.FashionMNIST(root="data", train=True, download=True)
        X = np.array(ds.data[:max_samples])
        y = np.array(ds.targets[:max_samples])
        meta = {"data_format": "image", "image_channels": 1, "image_height": 28, "image_width": 28}
    elif dataset_name == "cifar10":
        from torchvision import datasets as tvd
        ds = tvd.CIFAR10(root="data", train=True, download=True)
        X = np.array(ds.data[:max_samples])
        y = np.array(ds.targets[:max_samples])
        meta = {"data_format": "image", "image_channels": 3, "image_height": 32, "image_width": 32}
    else:
        raise ValueError(f"Unknown image dataset: {dataset_name}")

    test_size = split_config.get("test_size", 0.2)
    random_state = split_config.get("random_state", 42)
    X_train, X_test, y_train, y_test = tts(X, y, test_size=test_size, random_state=random_state)

    input_data = {
        "X_train": X_train.tolist(),
        "X_test": X_test.tolist(),
        "y_train": y_train.tolist(),
        "y_test": y_test.tolist(),
        "task_type": "classification",
        "dataset_name": dataset_name,
        **meta,
    }

    from modal_service.trainers.mlp_trainer import train
    return train(input_data, train_config)


@app.function(image=image, cpu=2)
def split_and_train_cnn(dataset_name, max_samples, split_config, train_config):
    import numpy as np
    from sklearn.model_selection import train_test_split as tts

    if dataset_name == "mnist":
        from torchvision import datasets as tvd
        ds = tvd.MNIST(root="data", train=True, download=True)
        X = np.array(ds.data[:max_samples])
        y = np.array(ds.targets[:max_samples])
        meta = {"data_format": "image", "image_channels": 1, "image_height": 28, "image_width": 28}
    elif dataset_name == "fashion_mnist":
        from torchvision import datasets as tvd
        ds = tvd.FashionMNIST(root="data", train=True, download=True)
        X = np.array(ds.data[:max_samples])
        y = np.array(ds.targets[:max_samples])
        meta = {"data_format": "image", "image_channels": 1, "image_height": 28, "image_width": 28}
    elif dataset_name == "cifar10":
        from torchvision import datasets as tvd
        ds = tvd.CIFAR10(root="data", train=True, download=True)
        X = np.array(ds.data[:max_samples])
        y = np.array(ds.targets[:max_samples])
        meta = {"data_format": "image", "image_channels": 3, "image_height": 32, "image_width": 32}
    else:
        raise ValueError(f"Unsupported image dataset for CNN: {dataset_name}")

    test_size = split_config.get("test_size", 0.2)
    random_state = split_config.get("random_state", 42)
    X_train, X_test, y_train, y_test = tts(X, y, test_size=test_size, random_state=random_state)

    input_data = {
        "X_train": X_train.tolist(),
        "X_test": X_test.tolist(),
        "y_train": y_train.tolist(),
        "y_test": y_test.tolist(),
        "task_type": "classification",
        "dataset_name": dataset_name,
        **meta,
    }

    from modal_service.trainers.cnn_trainer import train
    return train(input_data, train_config)

@app.function()
def hello():
    return "Modal is working"