import rasterio
import numpy as np

from rasterio.warp import calculate_default_transform, reproject, Resampling


class SpatialAligner:

    def __init__(self, reference_file, target_file):
        self.reference_file = reference_file
        self.target_file = target_file

    def get_reference_info(self):
        with rasterio.open(self.reference_file) as src:
            return {
                "crs": src.crs,
                "transform": src.transform,
                "width": src.width,
                "height": src.height,
                "bounds": src.bounds,
                "resolution": src.res,
            }

    def align(self):

        reference = self.get_reference_info()

        with rasterio.open(self.target_file) as src:
            if src.crs is None:
                raise ValueError("Target raster does not contain CRS information")

            if reference["CRS"] is None:
                raise ValueError("Reference raster does not contain CRS information")

            destination = np.zeros(
                (src.count, reference["height"], reference["width"]), dtype=np.float32
            )

            for band in range(src.count):

                reproject(
                    source=rasterio.band(src, band + 1),
                    destination=destination[band],
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=reference["transform"],
                    dst_crs=reference["crs"],
                    resampling=Resampling.bilinear,
                )

        metadata = {
            "crs": reference["crs"],
            "transform": reference["transform"],
            "width": reference["width"],
            "height": reference["height"],
            "resolution": reference["resolution"],
        }


        return destination, metadata

    