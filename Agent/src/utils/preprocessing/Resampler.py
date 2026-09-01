import numpy as np
from rasterio.enums import Resampling
from rasterio.transform import Affine
from rasterio.warp import reproject



class Resampler:

    def __init__(self, method="bilinear"):
        self.methods = {
            "nearest": Resampling.nearest,
            "bilinear": Resampling.bilinear,
            "cubic": Resampling.cubic,
            "average": Resampling.average
        }

        if method not in self.methods:
            raise ValueError(
                f"Unsupported resampling method: {method}"
            )

        self.method = self.methods[method]


    def resample(
            self,
            data,
            src_transform,
            src_crs,
            dst_transform,
            dst_crs,
            dst_width,
            dst_height
    ):

        if data.ndim != 3:
            raise ValueError(
                "Expected raster data with shape"
                "(bands, height, width)"
            )

        bands = data.shape[0]

        output = np.zeros(
            (
                bands,
                dst_height,
                dst_width
            ),
            dtype=np.float32
        )


        for band in range(bands):
            reproject(
                source=data[band],
                destination=output[band],
                src_transform=src_transform,
                src_crs=src_crs,
                dst_transform=dst_transform,
                dst_crs=dst_crs,
                resampling=self.method
            )


        return output
