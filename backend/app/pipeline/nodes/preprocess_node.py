from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

SCALER_REGISTRY = {
    "standard": StandardScaler,
    "minmax": MinMaxScaler,
    "robust": RobustScaler
}

def run(input_data, config):
    scaler_type = config.get("scaler_type", "standard")
    if scaler_type not in SCALER_REGISTRY:
        raise ValueError(f"Unknown scaler type: {scaler_type}")
    
    X_train = input_data.get("X_train")
    X_test = input_data.get("X_test")
    
    scaler_class = SCALER_REGISTRY[scaler_type]
    scaler = scaler_class()
    
    scaled_X_train = scaler.fit_transform(X_train)
    scaled_X_test = scaler.transform(X_test)
    
    return {
        "X_train": scaled_X_train,
        "X_test": scaled_X_test,
        "y_train": input_data["y_train"],
        "y_test": input_data["y_test"],
        "task_type": input_data["task_type"],
        "preprocessing": {
            "scaler_type": scaler_type
        }
    }