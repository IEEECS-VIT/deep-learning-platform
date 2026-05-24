from sklearn.datasets import load_iris, load_wine, load_breast_cancer, fetch_california_housing, load_diabetes

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
    }
}

def run(input_data, config):
    dataset_name = config.get("dataset", "iris")
    
    if dataset_name not in DATASET_REGISTRY:
        raise ValueError(f"Unknown dataset '{dataset_name}'")
    
    dataset_info = DATASET_REGISTRY[dataset_name]
    dataset_loader = dataset_info["loader"]
    task_type = dataset_info["task_type"]
    dataset = dataset_loader()
    
    return {
        "X": dataset.data.tolist(),
        "y": dataset.target.tolist(),
        "dataset_name": dataset_name,
        "task_type": task_type
    }