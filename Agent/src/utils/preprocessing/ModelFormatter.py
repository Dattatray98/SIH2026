import numpy as np
from PIL import Image


class ModelFormatter:

    def __init__(self, image_size=(512, 512)):
        self.image_size = image_size

    def to_rgb(self, data, red_index=0, green_index=1, blue_index=2):

        if data.ndim != 3:
            raise ValueError(
                "Expected data with shape "
                "(bands, height, width)"
            )

        if data.shape[0] < 3:
            raise ValueError(
                "At least 3 bands are required for RGB conversion"
            )

        rgb = np.stack(
            [
                data[red_index],
                data[green_index],
                data[blue_index]
            ],
            axis=-1
        )

        rgb = np.clip(
            rgb * 255,
            0,
            255
        ).astype(np.uint8)

        return rgb

    def resize_rgb(self, rgb):


        image = Image.fromarray(rgb)

        image = image.resize(
            self.image_size,
            Image.Resampling.BILINEAR
        )

        return np.asarray(image)

    def to_multispectral_tensor(self, data):


        if data.ndim != 3:
            raise ValueError(
                "Expected data with shape "
                "(bands, height, width)"
            )

        return data.astype(
            np.float32
        )

    def to_sar_tensor(self, data):


        if data.ndim != 3:
            raise ValueError(
                "Expected data with shape "
                "(bands, height, width)"
            )

        return data.astype(
            np.float32
        )

    def format_rgb(self, data):


        rgb = self.to_rgb(data)

        rgb = self.resize_rgb(rgb)

        return {
            "data": rgb,
            "format": "RGB",
            "shape": rgb.shape
        }

    def format_multispectral(self, data):


        tensor = self.to_multispectral_tensor(
            data
        )

        return {
            "data": tensor,
            "format": "MULTISPECTRAL",
            "shape": tensor.shape
        }

    def format_sar(self, data):

        tensor = self.to_sar_tensor(
            data
        )

        return {
            "data": tensor,
            "format": "SAR",
            "shape": tensor.shape
        }