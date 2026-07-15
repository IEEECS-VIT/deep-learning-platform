from app.dl.trainers.mlp_trainer import train

def test_loss_history_matches_epochs():
    input_data = {
        "X_train": [[1.0, 2.0], [2.0, 3.0], [3.0, 4.0]],
        "X_test": [[1.5, 2.5]],
        "y_train": [0, 1, 1],
        "y_test": [1]
    }
    config = {
        "epochs": 10
    }

    result = train(input_data, config)
    assert len(result["loss_history"]) == 10