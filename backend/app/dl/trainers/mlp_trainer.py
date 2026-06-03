from networkx import config
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score
from app.dl.models.mlp import MLP
from torch.utils.data import TensorDataset, DataLoader

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
    batch_size = config.get("batch_size", 32)
    optimizer_name = config.get("optimizer", "adam")
    train_dataset = TensorDataset(X_train, y_train)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    model = MLP(
        input_size=input_size,
        hidden_size=hidden_size,
        output_size=output_size
    )
    criterion = nn.CrossEntropyLoss()
    if optimizer_name == "adam":
        optimizer = optim.Adam(
            model.parameters(),
            lr=learning_rate
        )
    else:
        raise ValueError(f"Unknown optimizer: {optimizer_name}")
    
    loss_history = []
    for _ in range(epochs):
        epoch_loss = 0.0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        loss_history.append(
            epoch_loss / len(train_loader)
        )

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
            "loss": float(loss_history[-1])
        },
        "loss_history": loss_history,
        "config_used": config,
        "run_summary": {
            "model": "mlp",
            "task_type": "classification"
        },
        "training_summary": {
            "epochs": epochs,
            "learning_rate": learning_rate,
            "hidden_size": hidden_size,
            "batch_size": batch_size,
            "optimizer": optimizer_name
        }
    }