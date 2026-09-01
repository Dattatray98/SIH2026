from pathlib import Path
import rasterio
from rasterio.warp import transform_bounds


from pathlib import Path
import rasterio
from rasterio.warp import transform_bounds


class CompatibilityValidator:

    def __init__(self, file1, file2):
        self.file1 = Path(file1)
        self.file2 = Path(file2)

    def extract_info(self, file):
        """
        Extract spatial and raster information from an image.
        """

        with rasterio.open(file) as src:

            return {
                "width": src.width,
                "height": src.height,
                "count": src.count,
                "crs": src.crs,
                "bounds": src.bounds,
                "resolution": src.res,
                "transform": src.transform,
                "dtype": src.dtypes
            }

    def check_dimensions(self, info1, info2):
        """
        Check whether the images have compatible dimensions.
        """

        if (
            info1["width"] == info2["width"]
            and
            info1["height"] == info2["height"]
        ):
            return {
                "valid": True,
                "message": "Image dimensions match"
            }

        return {
            "valid": False,
            "message": (
                f"Image dimensions do not match: "
                f"{info1['width']}x{info1['height']} vs "
                f"{info2['width']}x{info2['height']}"
            )
        }

    def check_crs(self, info1, info2):
        """
        Check coordinate reference systems.
        """

        if info1["crs"] is None or info2["crs"] is None:

            return {
                "valid": False,
                "message": "One or both images are missing CRS information"
            }

        if info1["crs"] == info2["crs"]:

            return {
                "valid": True,
                "message": "CRS matches"
            }

        return {
            "valid": False,
            "message": (
                f"CRS mismatch: "
                f"{info1['crs']} vs {info2['crs']}"
            )
        }

    def check_resolution(self, info1, info2):
        """
        Check spatial resolution compatibility.
        """

        res1_x, res1_y = info1["resolution"]
        res2_x, res2_y = info2["resolution"]

        tolerance = 0.10

        x_difference = abs(res1_x - res2_x) / max(res1_x, res2_x)
        y_difference = abs(res1_y - res2_y) / max(res1_y, res2_y)

        if x_difference <= tolerance and y_difference <= tolerance:

            return {
                "valid": True,
                "message": "Spatial resolutions are compatible"
            }

        return {
            "valid": False,
            "message": (
                f"Spatial resolution mismatch: "
                f"{info1['resolution']} vs "
                f"{info2['resolution']}"
            )
        }

    def check_spatial_overlap(self, info1, info2):
        """
        Check whether the two images overlap spatially.
        """

        bounds1 = info1["bounds"]
        bounds2 = info2["bounds"]

        # If CRS is different, convert second bounds
        if info1["crs"] != info2["crs"]:

            try:

                transformed_bounds = transform_bounds(
                    info2["crs"],
                    info1["crs"],
                    bounds2.left,
                    bounds2.bottom,
                    bounds2.right,
                    bounds2.top
                )

                left2, bottom2, right2, top2 = transformed_bounds

            except Exception as e:

                return {
                    "valid": False,
                    "message": f"Unable to transform spatial bounds: {str(e)}"
                }

        else:

            left2 = bounds2.left
            bottom2 = bounds2.bottom
            right2 = bounds2.right
            top2 = bounds2.top

        overlap = not (
            bounds1.right <= left2
            or
            bounds1.left >= right2
            or
            bounds1.top <= bottom2
            or
            bounds1.bottom >= top2
        )

        if overlap:

            return {
                "valid": True,
                "message": "Images have spatial overlap"
            }

        return {
            "valid": False,
            "message": "Images do not overlap spatially"
        }

    def validate(self):
        """
        Perform complete compatibility validation.
        """

        result = {
            "compatible": False,
            "errors": [],
            "checks": {}
        }

        # Check files
        if not self.file1.exists():

            result["errors"].append(
                f"First image does not exist: {self.file1}"
            )

        if not self.file2.exists():

            result["errors"].append(
                f"Second image does not exist: {self.file2}"
            )

        if result["errors"]:
            return result

        # Read metadata
        try:

            info1 = self.extract_info(self.file1)
            info2 = self.extract_info(self.file2)

        except Exception as e:

            result["errors"].append(
                f"Unable to read raster information: {str(e)}"
            )

            return result

        # Run checks
        result["checks"]["dimensions"] = self.check_dimensions(
            info1,
            info2
        )

        result["checks"]["crs"] = self.check_crs(
            info1,
            info2
        )

        result["checks"]["resolution"] = self.check_resolution(
            info1,
            info2
        )

        result["checks"]["spatial_overlap"] = self.check_spatial_overlap(
            info1,
            info2
        )

        # Determine compatibility
        required_checks = [
            "crs",
            "resolution",
            "spatial_overlap"
        ]

        result["compatible"] = all(
            result["checks"][check]["valid"]
            for check in required_checks
        )

        return result