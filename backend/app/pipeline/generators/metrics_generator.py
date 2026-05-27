def generate_metrics_code(config):
    algorithm = config.get("algorithm", "logistic_regression")

    imports = set()
    code = [
        "# Evaluation"
    ]

    classification_models = [
        "logistic_regression",
        "decision_tree",
        "random_forest"
    ]

    regression_models = [
        "linear_regression"
    ]

    if algorithm in classification_models:
        imports.add("from sklearn.metrics import accuracy_score")

        code.extend([
            "accuracy = accuracy_score(y_test, predictions)",
            'print(f"Accuracy: {accuracy:.4f}")',
            ""
        ])

    elif algorithm in regression_models:
        imports.update({
            "from sklearn.metrics import mean_squared_error",
            "from sklearn.metrics import r2_score"
        })

        code.extend([
            "mse = mean_squared_error(y_test, predictions)",
            "r2 = r2_score(y_test, predictions)",
            'print(f"MSE: {mse:.4f}")',
            'print(f"R2 Score: {r2:.4f}")',
            ""
        ])

    return imports, code