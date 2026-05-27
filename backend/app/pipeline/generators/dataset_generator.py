def generate_dataset_code(config):
    dataset_name = config.get("dataset", "iris")

    imports = {f"from sklearn.datasets import load_{dataset_name}"}

    code = [
        "# Load Dataset",
        f"dataset = load_{dataset_name}()",
        "X = dataset.data",
        "y = dataset.target",
        ""
    ]

    return imports, code