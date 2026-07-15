from app.dl.trainers.mlp_trainer import train

def test_mlp_training_returns_metrics():
    input_data = {
        "X_train": [[1.0, 2.0], [2.0, 3.0], [3.0, 4.0]],
        "X_test": [[1.5, 2.5]],
        "y_train": [0, 1, 1],
        "y_test": [1]
    }
    config = {
        "hidden_size": 16,
        "epochs": 5,
        "learning_rate": 0.001,
        "batch_size": 32,
        "optimizer": "adam"
    }
    result = train(input_data, config)

    assert "metrics" in result
    assert "accuracy" in result["metrics"]
    assert "loss" in result["metrics"]