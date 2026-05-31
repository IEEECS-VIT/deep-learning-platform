def generate_neural_network_code(config):

    hidden_size = config.get("hidden_size", 128)
    epochs = config.get("epochs", 10)
    learning_rate = config.get("learning_rate", 0.001)

    imports = {
        "import torch",
        "import torch.nn as nn",
        "import torch.optim as optim"
    }

    code = [
        "# Neural Network",
        "",
        "class MLP(nn.Module):",
        "    def __init__(self, input_size, hidden_size, output_size):",
        "        super().__init__()",
        "",
        "        self.network = nn.Sequential(",
        "            nn.Linear(input_size, hidden_size),",
        "            nn.ReLU(),",
        "            nn.Linear(hidden_size, output_size)",
        "        )",
        "",
        "    def forward(self, x):",
        "        return self.network(x)",
        "",
        "model = MLP(",
        "    input_size=X_train.shape[1],",
        f"    hidden_size={hidden_size},",
        "    output_size=len(set(y_train))",
        ")",
        "",
        "criterion = nn.CrossEntropyLoss()",
        f"optimizer = optim.Adam(model.parameters(), lr={learning_rate})",
        "",
        "X_train_tensor = torch.tensor(X_train, dtype=torch.float32)",
        "X_test_tensor = torch.tensor(X_test, dtype=torch.float32)",
        "y_train_tensor = torch.tensor(y_train, dtype=torch.long)",
        "",
        f"for epoch in range({epochs}):",
        "    optimizer.zero_grad()",
        "",
        "    outputs = model(X_train_tensor)",
        "    loss = criterion(outputs, y_train_tensor)",
        "",
        "    loss.backward()",
        "    optimizer.step()",
        "",
        "with torch.no_grad():",
        "    predictions = model(X_test_tensor)",
        "    predictions = predictions.argmax(dim=1)",
        "",
        "# Evaluation",
        "accuracy = accuracy_score(",
        "    y_test,",
        "    predictions.numpy()",
        ")",
        "",
        "print(f'Accuracy: {accuracy:.4f}')",
        "print(f'Final Loss: {loss.item():.4f}')",
        ""
    ]

    return imports, code