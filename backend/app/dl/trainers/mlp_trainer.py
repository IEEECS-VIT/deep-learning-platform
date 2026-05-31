import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score
from app.dl.models.mlp import MLP

def train(input_data, config):
    X_train = torch.tensor(input_data["X_train"], dtype=torch.float32)
    X_test = torch.tensor(input_data["X_test"], dtype=torch.float32)
    y_train = torch.tensor(input_data["y_train"], dtype=torch.long)
    y_test = torch.tensor(input_data["y_test"], dtype=torch.long)
    input_size = X_train.shape[1]
    output_size = len(set(input_data["y_train"]))
    hidden_size = config.get("hidden_size", 128)
    epochs = config.get("epochs", 10)
    learning_rate = config.get("learning_rate", 0.001)

    model = MLP(
        input_size=input_size,
        hidden_size=hidden_size,
        output_size=output_size
    )
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(
        model.parameters(),
        lr=learning_rate
    )
    for _ in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()

    with torch.no_grad():
        predictions = model(X_test)
        predicted_classes = predictions.argmax(dim=1)

    accuracy = accuracy_score(
        y_test.numpy(),
        predicted_classes.numpy()
    )

    return {
        "model_name": "mlp",
        "predictions": predicted_classes.tolist(),
        "predictions_preview": predicted_classes[:10].tolist(),
        "metrics": {
            "accuracy": float(accuracy),
            "loss": float(loss.item())
        },
        "config_used": config,
        "run_summary": {
            "model": "mlp",
            "task_type": "classification"
        }
    }