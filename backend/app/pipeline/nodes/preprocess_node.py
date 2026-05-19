def run(input_data, config):
    scale_factor = config.get("scale_factor", 1)
    X_train = input_data["X_train"]
    X_test = input_data["X_test"]
    
    scaled_X_train = [[x * scale_factor for x in row] for row in X_train]
    scaled_X_test = [[x * scale_factor for x in row] for row in X_test]

    return {
        "X_train": scaled_X_train,
        "X_test": scaled_X_test,
        "y_train": input_data["y_train"],
        "y_test": input_data["y_test"],
        "task_type": input_data["task_type"]
    }