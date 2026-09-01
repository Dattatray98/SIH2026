import rasterio
from rasterio.windows import window
from pathlib import Path


class RasterValidator:
    def __init__(self, file):
        self.file = file

    def Open_raster(self):

        with rasterio.open(self.file) as src:

            width = min(512, src.width)
            height = min(512, src.height)

            win = window(col_off=0, row_off=0, width=width, height=height)

            data = src.read(1, window=win)

            return data

    def extract_metadata(self):
        with rasterio.open(self.file) as src:
            metadata = {
                "driver" : src.driver,
                "width" : src.width,
                "height": src.height,
                "count": src.count,
                "dtype": src.dtype,
                "crs" : src.crs.to_string() if src.crs else None,
                "transform" : tuple(src.transform),
                "bounds" : {
                    "left" : src.bounds.left,
                    "bottom" : src.bounds.bottom,
                    "right" : src.bounds.right,
                    "top" : src.bounds.top
                },
                "resolution" : src.res,
                "nodata" : src.nodata
            }

            return metadata

    def validate_dimensions(self, metadata):
        errors = []

        if metadata["width"] <= 0:
            errors.append("Invalid raster width")

        if metadata["height"] <= 0:
            errors.append("Invalid raster height")

        return errors


    def validate_bands(self, metadata):
        errors = []

        if metadata["count"] <= 0:
            errors.append("Raster contains no bands")

        return errors


    def validate_georeferencing(self, metadata):
        errors = []

        if metadata["crs"] is None:
            errors.append("CRS information is missing")

        if metadata["transform"] is None:
            errors.append("Geotransform information is missing")

        return errors

    def validate(self):
        result = {
            "valid":False,
            "file":str(self.file),
            "errors":[],
            "warnings":[],
            "metadata":None
        }

        if not self.file.exists():
            result["errors"].append("Raster file does not exists")
            return result

        try:
            self.Open_raster()
        except Exception as e:
            result['errors'].append(
                f"Raster cannot be opened or read : {str(e)}"
            )

            return result

        try:
            metadata = self.extract_metadata()
            result["metadata"] = metadata
        except Exception as e:
            result["errors"].append(
                f"metadata extraction failed : {str(e)}"
            )
            return result

        result["errors"].extend(
            self.validate_dimensions(metadata)
        )

        result["errors"].extend(
            self.validate_bands(metadata)
        )

        result["errors"].extend(
            self.validate_georeferencing(metadata)
        )

        if metadata["crs"] is None:
            result["warnings"].append(
                "Raaster has no CRS;  geospatial operations may be unreliable"
            )

        if metadata["nodata"] is None:
            result["warnings"].append(
                "No NoData value is defined"
            )

        result["valid"] = len(result['errors']) == 0

        return result
    