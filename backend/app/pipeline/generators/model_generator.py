def generate_model_code(config):
    algorithm = config.get("algorithm", "logistic_regression")

    imports = set()
    code = ["# Model Training"]

    if algorithm == "logistic_regression":
        imports.add("from sklearn.linear_model import LogisticRegression")

        C = config.get("C", 1.0)
        solver = config.get("solver", "lbfgs")

        code.extend([
            f'model = LogisticRegression(C={C}, solver="{solver}", max_iter=1000)',
            "model.fit(X_train, y_train)",
            "predictions = model.predict(X_test)",
            ""
        ])

    elif algorithm == "linear_regression":
        imports.add("from sklearn.linear_model import LinearRegression")

        fit_intercept = config.get("fit_intercept", True)

        code.extend([
            f"model = LinearRegression(fit_intercept={fit_intercept})",
            "model.fit(X_train, y_train)",
            "predictions = model.predict(X_test)",
            ""
        ])

    elif algorithm == "decision_tree":
        imports.add("from sklearn.tree import DecisionTreeClassifier")

        max_depth = config.get("max_depth", 5)
        criterion = config.get("criterion", "gini")

        code.extend([
            f'model = DecisionTreeClassifier(max_depth={max_depth}, criterion="{criterion}", random_state=42)',
            "model.fit(X_train, y_train)",
            "predictions = model.predict(X_test)",
            ""
        ])

    elif algorithm == "random_forest":
        imports.add("from sklearn.ensemble import RandomForestClassifier")

        n_estimators = config.get("n_estimators", 100)
        max_depth = config.get("max_depth", 5)

        code.extend([
            f"model = RandomForestClassifier(n_estimators={n_estimators}, max_depth={max_depth}, random_state=42)",
            "model.fit(X_train, y_train)",
            "predictions = model.predict(X_test)",
            ""
        ])

    return imports, code