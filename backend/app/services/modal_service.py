import modal

train_mlp = modal.Function.from_name("deep-learning-platform", "train_mlp")
train_cnn = modal.Function.from_name("deep-learning-platform","train_cnn")
load_mnist = modal.Function.from_name("deep-learning-platform","load_mnist")
load_fashion_mnist = modal.Function.from_name("deep-learning-platform","load_fashion_mnist")
load_cifar10 = modal.Function.from_name("deep-learning-platform","load_cifar10")
split_and_train_mlp = modal.Function.from_name("deep-learning-platform", "split_and_train_mlp")
split_and_train_cnn = modal.Function.from_name("deep-learning-platform", "split_and_train_cnn")

def run_mlp(input_data, config):
    return train_mlp.remote(input_data, config)
def run_cnn(input_data, config):
    return train_cnn.remote(input_data, config)
def get_mnist(max_samples=2000):
    return load_mnist.remote(max_samples)
def get_fashion_mnist(max_samples=2000):
    return load_fashion_mnist.remote(max_samples)
def get_cifar10(max_samples=2000):
    return load_cifar10.remote(max_samples)
def run_split_and_train_mlp(dataset_name, max_samples, split_config, train_config):
    return split_and_train_mlp.remote(dataset_name, max_samples, split_config, train_config)
def run_split_and_train_cnn(dataset_name, max_samples, split_config, train_config):
    return split_and_train_cnn.remote(dataset_name, max_samples, split_config, train_config)