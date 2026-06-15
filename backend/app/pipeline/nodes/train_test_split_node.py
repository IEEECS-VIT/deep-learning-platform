from sklearn.model_selection import train_test_split

def run(input_data, config):
    X= input_data["X"]
    y = input_data["y"]
    
    test_size = config.get("test_size", 0.2)
    random_state = config.get("random_state", 42)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)
    
    output = {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "task_type": input_data["task_type"],
        "split_test_size": test_size,
        "split_random_state": random_state
    }

    for key in [
        "data_format",
        "dataset_name",
        "data_dir",
        "image_channels",
        "image_height",
        "image_width",
    ]:
        if key in input_data:
            output[key] = input_data[key]

    return output
