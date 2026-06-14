import modal

train_mlp = modal.Function.from_name("deep-learning-platform", "train_mlp")

train_cnn = modal.Function.from_name("deep-learning-platform", "train_cnn")

def run_mlp(input_data, config):
    return train_mlp.remote(input_data, config)

def run_cnn(input_data, config):
    return train_cnn.remote(input_data, config)