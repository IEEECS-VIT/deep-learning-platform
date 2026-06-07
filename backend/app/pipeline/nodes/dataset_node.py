import os

from sklearn.datasets import (
    load_iris,
    load_wine,
    load_breast_cancer,
    fetch_california_housing,
    load_diabetes,
    load_digits,
)
from torchvision import datasets


DEFAULT_DATA_DIR = os.getenv("DLP_DATA_DIR", "data")

DATASET_REGISTRY = {
    "iris": {
        "loader": load_iris,
        "task_type": "classification"
    },
    "wine": {
        "loader": load_wine,
        "task_type": "classification"
    },
    "breast_cancer": {
        "loader": load_breast_cancer,
        "task_type": "classification"
    },
    "california_housing": {
        "loader": fetch_california_housing,
        "task_type": "regression"
    },
    "diabetes": {
        "loader": load_diabetes,
        "task_type": "regression"
    },
    "digits": {
        "loader": load_digits,
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 1,
        "image_height": 8,
        "image_width": 8
    },
    "mnist": {
        "loader": datasets.MNIST,
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 1,
        "image_height": 28,
        "image_width": 28
    },
    "fashion_mnist": {
        "loader": datasets.FashionMNIST,
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 1,
        "image_height": 28,
        "image_width": 28
    },
    "cifar10": {
        "loader": datasets.CIFAR10,
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 3,
        "image_height": 32,
        "image_width": 32
    }
}


def _image_metadata(dataset_info):
    return {
        "data_format": dataset_info["data_format"],
        "image_channels": dataset_info["image_channels"],
        "image_height": dataset_info["image_height"],
        "image_width": dataset_info["image_width"],
    }


def _load_torchvision_dataset(dataset_info, data_dir):
    dataset = dataset_info["loader"](
        root=data_dir,
        train=True,
        download=True
    )

    if hasattr(dataset, "data"):
        X = dataset.data
        if hasattr(X, "numpy"):
            X = X.numpy()
        X = X.tolist()
    else:
        X = [image for image, _ in dataset]

    if hasattr(dataset, "targets"):
        y = dataset.targets
        if hasattr(y, "tolist"):
            y = y.tolist()
    else:
        y = [target for _, target in dataset]

    return X, y


def run(input_data, config):
    dataset_name = config.get("dataset", "iris")
    
    if dataset_name not in DATASET_REGISTRY:
        raise ValueError(f"Unknown dataset '{dataset_name}'")
    
    dataset_info = DATASET_REGISTRY[dataset_name]
    dataset_loader = dataset_info["loader"]
    task_type = dataset_info["task_type"]

    if dataset_name == "digits":
        dataset = dataset_loader()
        X = dataset.images.tolist()
        return {
            "X": X,
            "y": dataset.target.tolist(),
            "dataset_name": dataset_name,
            "task_type": task_type,
            **_image_metadata(dataset_info)
        }

    if dataset_info.get("data_format") == "image":
        data_dir = config.get("data_dir", DEFAULT_DATA_DIR)
        X, y = _load_torchvision_dataset(dataset_info, data_dir)
        return {
            "X": X,
            "y": y,
            "dataset_name": dataset_name,
            "task_type": task_type,
            "data_dir": data_dir,
            **_image_metadata(dataset_info)
        }

    dataset = dataset_loader()
    
    return {
        "X": dataset.data.tolist(),
        "y": dataset.target.tolist(),
        "dataset_name": dataset_name,
        "task_type": task_type
    }
