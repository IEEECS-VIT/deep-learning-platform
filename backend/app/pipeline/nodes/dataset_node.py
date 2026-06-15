from sklearn.datasets import (
    load_iris,
    load_wine,
    load_breast_cancer,
    fetch_california_housing,
    load_diabetes,
    load_digits,
)
from app.services.modal_service import (get_mnist, get_fashion_mnist, get_cifar10)

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
    }
}


def _image_metadata(dataset_info):
    return {
        "data_format": dataset_info["data_format"],
        "image_channels": dataset_info["image_channels"],
        "image_height": dataset_info["image_height"],
        "image_width": dataset_info["image_width"],
    }


def run(input_data, config):
    dataset_name = config.get("dataset", "iris")
    if dataset_name == "mnist":
        return get_mnist(config.get("max_samples", 2000))
    if dataset_name == "fashion_mnist":
        return get_fashion_mnist(config.get("max_samples", 2000))
    if dataset_name == "cifar10":
        return get_cifar10(config.get("max_samples", 2000))
    if dataset_name not in DATASET_REGISTRY:
        raise ValueError(f"Unknown dataset '{dataset_name}'")

    dataset_info = DATASET_REGISTRY[dataset_name]
    
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

    dataset = dataset_loader()
    
    return {
        "X": dataset.data.tolist(),
        "y": dataset.target.tolist(),
        "dataset_name": dataset_name,
        "task_type": task_type
    }
