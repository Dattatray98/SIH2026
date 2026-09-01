import rasterio 
from pathlib import Path



class RasterReader:


    def __init__(self, file):
        self.file = Path(file)


    def read(self):

        if not self.file.exists():
            raise FileNotFoundError(
                f"Raster file not found : {self.file}"
            )


        try:
            with rasterio.open(self.file) as src:

                data = src.read()

                metadata = {
                    "driver": src.driver,
                    "width": src.width,
                    "height": src.height,
                    "count": src.count,
                    "dtype": src.dtypes,
                    "crs": src.crs,
                    "transform": src.transform,
                    "bounds": src.bounds,
                    "resolution": src.res,
                    "nodata": src.nodata
                }

            return data, metadata


        except rasterio.errors.RasterioError as e:
            raise ValueError(
                f"Unable to read raster : {e}"
            )

    