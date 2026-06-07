def generate_preprocess_code(config):
    scaler_type = config.get("scaler_type", "standard")

    scaler_map = {
        "standard": "StandardScaler",
        "minmax": "MinMaxScaler",
        "robust": "RobustScaler"
    }

    scaler_class = scaler_map[scaler_type]

    imports = {
        f"from sklearn.preprocessing import {scaler_class}"
    }

    code = [
        "# Preprocessing",
        "if globals().get('data_format') != 'image':",
        f"    scaler = {scaler_class}()",
        "    X_train = scaler.fit_transform(X_train)",
        "    X_test = scaler.transform(X_test)",
        ""
    ]

    return imports, code
