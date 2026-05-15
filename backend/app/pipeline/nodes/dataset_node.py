def run(input_data, config):
    dataset_name = config.get("dataset", "dummy")
    if dataset_name == "dummy":
        return {
            "X_train": [[1], [2], [3]],
            "y_train": [2, 4, 6],
        }
    raise ValueError(f"Unknown dataset: {dataset_name}")