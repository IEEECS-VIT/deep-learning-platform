from modal_service.trainers.cnn_trainer import train


def test_cnn_training_returns_shaped_output():
    input_data = {
        "X_train": [
            [[0.0] * 8 for _ in range(8)],
            [[1.0] * 8 for _ in range(8)],
            [[0.5] * 8 for _ in range(8)],
            [[0.25] * 8 for _ in range(8)],
        ],
        "X_test": [
            [[0.75] * 8 for _ in range(8)],
            [[0.1] * 8 for _ in range(8)],
        ],
        "y_train": [0, 1, 1, 0],
        "y_test": [1, 0],
        "task_type": "classification",
        "data_format": "image",
    }
    config = {
        "architecture": "cnn",
        "hidden_size": 16,
        "epochs": 2,
        "learning_rate": 0.001,
        "batch_size": 2,
        "optimizer": "adam",
    }

    result = train(input_data, config)

    assert result["model_name"] == "cnn"
    assert "accuracy" in result["metrics"]
    assert "loss" in result["metrics"]
    assert "best_loss" in result
    assert "final_loss" in result
    assert len(result["loss_history"]) == 2
    assert len(result["predictions"]) == 2
    assert result["training_summary"]["learning_rate"] == 0.001
    assert result["training_summary"]["optimizer"] == "adam"


def test_cnn_training_supports_sgd_and_rgb_images():
    input_data = {
        "X_train": [
            [[[0.0, 0.1, 0.2] for _ in range(32)] for _ in range(32)],
            [[[1.0, 0.9, 0.8] for _ in range(32)] for _ in range(32)],
            [[[0.5, 0.4, 0.3] for _ in range(32)] for _ in range(32)],
            [[[0.2, 0.3, 0.4] for _ in range(32)] for _ in range(32)],
        ],
        "X_test": [
            [[[0.7, 0.6, 0.5] for _ in range(32)] for _ in range(32)],
        ],
        "y_train": [0, 1, 1, 0],
        "y_test": [1],
        "task_type": "classification",
        "data_format": "image",
        "image_channels": 3,
        "image_height": 32,
        "image_width": 32,
    }
    config = {
        "architecture": "cnn",
        "filters": 4,
        "kernel_size": 3,
        "hidden_size": 8,
        "dropout": 0.1,
        "epochs": 1,
        "learning_rate": 0.001,
        "batch_size": 2,
        "optimizer": "sgd",
    }

    result = train(input_data, config)

    assert result["model_name"] == "cnn"
    assert result["training_summary"]["optimizer"] == "sgd"
    assert result["training_summary"]["filters"] == 4
    assert len(result["loss_history"]) == 1
