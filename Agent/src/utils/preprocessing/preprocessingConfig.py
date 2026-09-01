from dataclasses import dataclass


@dataclass
class PreprocessingConfig:

    image_size: tuple = (512, 512)

    normalization_lower_percentile: float = 2.0
    normalization_upper_percentile: float = 98.0

    optical_resampling: str = "bilinear"
    sar_resampling: str = "bilinear"

    nodata_fill_value: float = 0.0

    output_format: str = "numpy"

    def validate(self):

        if self.image_size[0] <= 0:
            raise ValueError(
                "Image width must be greater than zero"
            )

        if self.image_size[1] <= 0:
            raise ValueError(
                "Image height must be greater than zero"
            )

        if not (
            0 <= self.normalization_lower_percentile
            < self.normalization_upper_percentile <= 100
        ):
            raise ValueError(
                "Invalid normalization percentiles"
            )

        supported_resampling = [
            "nearest",
            "bilinear",
            "cubic",
            "average"
        ]

        if self.optical_resampling not in supported_resampling:
            raise ValueError(
                f"Unsupported optical resampling method: "
                f"{self.optical_resampling}"
            )

        if self.sar_resampling not in supported_resampling:
            raise ValueError(
                f"Unsupported SAR resampling method: "
                f"{self.sar_resampling}"
            )