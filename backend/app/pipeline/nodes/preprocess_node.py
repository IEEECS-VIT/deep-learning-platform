def run(input_data, config):
    scale_factor = config.get("scale_factor", 1)
    X_train = input_data["X_train"]
    scaled_X = [[x[0] * scale_factor] for x in X_train]

    return {
        "X_train": scaled_X,
        "y_train": input_data["y_train"]
    }