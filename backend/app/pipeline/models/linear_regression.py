from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

def train(input_data, config):
    X_train = input_data["X_train"]
    X_test = input_data["X_test"]
    y_train = input_data["y_train"]
    y_test = input_data["y_test"]
    
    model = LinearRegression(fit_intercept=config.get("fit_intercept", True))
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    return {
        "model_name": "Linear Regression",
        "predictions": predictions.tolist(),
        "metrics": {
            "mse": float(mse),
            "r2_score": float(r2)
        }
    }