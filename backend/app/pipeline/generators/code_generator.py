def generate_pipeline_code(pipeline):
    code_lines = [
        "from sklearn import datasets",
        "from sklearn.model_selection import train_test_split",
        "from sklearn.preprocessing import StandardScaler",
        "from sklearn.linear_model import LogisticRegression, LinearRegression",
        "from sklearn.tree import DecisionTreeClassifier",
        "from sklearn.ensemble import RandomForestClassifier",
        "",
    ]

    for node in pipeline["nodes"]:
        node_type = node["type"]
        config = node.get("config", {})

        if node_type == "dataset":
            dataset_name = config.get("dataset", "iris")

            code_lines.extend([
                f"dataset = datasets.load_{dataset_name}()",
                "X = dataset.data",
                "y = dataset.target",
                ""
            ])

        elif node_type == "train_test_split":
            test_size = config.get("test_size", 0.2)
            random_state = config.get("random_state", 42)

            code_lines.extend([
                "X_train, X_test, y_train, y_test = train_test_split(",
                "    X,",
                "    y,",
                f"    test_size={test_size},",
                f"    random_state={random_state}",
                ")",
                ""
            ])

        elif node_type == "preprocess":
            code_lines.extend([
                "scaler = StandardScaler()",
                "X_train = scaler.fit_transform(X_train)",
                "X_test = scaler.transform(X_test)",
                ""
            ])

        elif node_type == "model":
            algorithm = config.get("algorithm", "logistic_regression")

            if algorithm == "logistic_regression":
                code_lines.extend([
                    "model = LogisticRegression(max_iter=1000)",
                    "model.fit(X_train, y_train)",
                    "predictions = model.predict(X_test)",
                    ""
                ])

            elif algorithm == "linear_regression":
                fit_intercept = config.get("fit_intercept", True)

                code_lines.extend([
                    f"model = LinearRegression(fit_intercept={fit_intercept})",
                    "model.fit(X_train, y_train)",
                    "predictions = model.predict(X_test)",
                    ""
                ])

            elif algorithm == "decision_tree":
                code_lines.extend([
                    "model = DecisionTreeClassifier(random_state=42)",
                    "model.fit(X_train, y_train)",
                    "predictions = model.predict(X_test)",
                    ""
                ])

            elif algorithm == "random_forest":
                code_lines.extend([
                    "model = RandomForestClassifier(random_state=42)",
                    "model.fit(X_train, y_train)",
                    "predictions = model.predict(X_test)",
                    ""
                ])

    return "\n".join(code_lines)