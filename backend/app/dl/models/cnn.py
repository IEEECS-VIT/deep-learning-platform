import torch
import torch.nn as nn


class CNN(nn.Module):
    def __init__(
        self,
        num_classes,
        image_channels,
        image_height,
        image_width,
        filters=32,
        kernel_size=3,
        hidden_size=128,
        dropout=0.2
    ):
        super().__init__()
        padding = kernel_size // 2

        self.features = nn.Sequential(
            nn.Conv2d(image_channels, filters, kernel_size=kernel_size, padding=padding),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2),
            nn.Conv2d(filters, filters * 2, kernel_size=kernel_size, padding=padding),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2),
        )

        flattened_size = self._get_flattened_size(
            image_channels,
            image_height,
            image_width
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(flattened_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, num_classes),
        )

    def _get_flattened_size(self, image_channels, image_height, image_width):
        with torch.no_grad():
            sample = torch.zeros(1, image_channels, image_height, image_width)
            return self.features(sample).view(1, -1).shape[1]

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)
