from app.dl.trainers import mlp_trainer, cnn_trainer

NETWORK_REGISTRY = {
    "mlp": mlp_trainer.train,
    "cnn": cnn_trainer.train
}

def run(input_data, config):
    architecture = config.get("architecture", "mlp")
    if architecture not in NETWORK_REGISTRY:
        raise ValueError(
            f"Unknown architecture: {architecture}"
        )
    hidden_size = config.get("hidden_size", 128)
    epochs = config.get("epochs", 10)
    learning_rate = config.get("learning_rate", 0.001)
    batch_size = config.get("batch_size", 32)
    if hidden_size <= 0:
        raise ValueError("hidden_size must be greater than 0")
    if epochs <= 0:
        raise ValueError("epochs must be greater than 0")
    if learning_rate <= 0:
        raise ValueError("learning_rate must be greater than 0")
    if batch_size <= 0:
        raise ValueError("batch_size must be greater than 0")
    trainer = NETWORK_REGISTRY[architecture]
    return trainer(
        input_data,
        config
    )