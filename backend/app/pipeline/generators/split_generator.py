def generate_split_code(config):
    test_size = config.get("test_size", 0.2)
    random_state = config.get("random_state", 42)

    imports = {
        "from sklearn.model_selection import train_test_split"
    }

    code = [
        "# Train Test Split",
        "X_train, X_test, y_train, y_test = train_test_split(",
        "    X,",
        "    y,",
        f"    test_size={test_size},",
        f"    random_state={random_state}",
        ")",
        ""
    ]

    return imports, code