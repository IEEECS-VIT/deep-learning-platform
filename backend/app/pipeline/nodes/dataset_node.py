from sklearn.datasets import load_iris, load_wine, load_breast_cancer

DATASET_REGISTRY = {
    "iris": load_iris,
    "wine": load_wine,
    "breast_cancer": load_breast_cancer,
}

def run(input_data, config):
    dataset_name = config.get("dataset", "iris")
    
    if dataset_name not in DATASET_REGISTRY:
        raise ValueError(f"Unknown dataset '{dataset_name}'")
    
    dataset_loader = DATASET_REGISTRY[dataset_name]
    dataset = dataset_loader()
    
    return {
        "X": dataset.data.tolist(),
        "y": dataset.target.tolist(),
    }