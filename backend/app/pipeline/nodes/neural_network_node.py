from app.dl.trainers import mlp_trainer

NETWORK_REGISTRY = {"mlp": mlp_trainer.train}

def run(input_data, config):
    architecture = config.get("architecture", "mlp")
    if architecture not in NETWORK_REGISTRY:
        raise ValueError(f"Unknown architecture: {architecture}")
    trainer = NETWORK_REGISTRY[architecture]
    return trainer(input_data, config)