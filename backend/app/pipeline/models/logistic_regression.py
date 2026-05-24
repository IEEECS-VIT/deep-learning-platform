from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

def train(input_data, config):
    X_train = input_data["X_train"]
    X_test = input_data["X_test"]
    y_train = input_data["y_train"]
    y_test = input_data["y_test"]
    
    model = LogisticRegression(max_iter=1000)
    
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, predictions)
    
    return {
        "model_name": "logistic_regression",
        "predictions": predictions.tolist(),
        "predictions_preview": predictions[:10].tolist(),
        "metrics": {
            "accuracy": float(accuracy)
        },
        "config_used": config,
        "run_summary": {
            "model": "logistic_regression",
            "task_type": "classification"
        }
    }