from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

def train(input_data, config):
    X_train = input_data["X_train"]
    y_train = input_data["y_train"]
    
    model = LinearRegression(fit_intercept=config.get("fit_intercept", True))
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_train)
    
    mse = mean_squared_error(y_train, predictions)
    
    return {
        "model_name": "LinearRegression",
        "predictions": predictions.tolist(),
        "metrics": {
            "mse": mse
        }
    }