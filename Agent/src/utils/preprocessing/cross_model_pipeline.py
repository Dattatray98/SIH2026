from raster_reader import RasterReader # type: ignore
from spatial_aligner import SpatialAligner # type: ignore
from nodata_handler import NoDataHandler # type: ignore
from normalizer import Normalizer # type: ignore


class CrossModalPipeline:

    def __init__(
        self,
        optical_file,
        sar_file,
        config=None
    ):

        self.optical_file = optical_file
        self.sar_file = sar_file
        self.config = config

    def run(self):

        # --------------------------------------------
        # 1. Read optical
        # --------------------------------------------

        optical_reader = RasterReader(
            self.optical_file
        )

        optical_data, optical_metadata = (
            optical_reader.read()
        )

        # --------------------------------------------
        # 2. Read SAR
        # --------------------------------------------

        sar_reader = RasterReader(
            self.sar_file
        )

        sar_data, sar_metadata = (
            sar_reader.read()
        )

        # --------------------------------------------
        # 3. Handle NoData
        # --------------------------------------------

        optical_handler = NoDataHandler(
            optical_metadata["nodata"]
        )

        sar_handler = NoDataHandler(
            sar_metadata["nodata"]
        )

        optical_result = optical_handler.process(
            optical_data
        )

        sar_result = sar_handler.process(
            sar_data
        )

        optical_data = optical_result["data"]
        sar_data = sar_result["data"]

        # --------------------------------------------
        # 4. Normalize separately
        # --------------------------------------------

        optical_normalizer = Normalizer(
            "multispectral"
        )

        sar_normalizer = Normalizer(
            "sar"
        )

        optical_data = (
            optical_normalizer.normalize(
                optical_data
            )
        )

        sar_data = (
            sar_normalizer.normalize(
                sar_data
            )
        )

        # --------------------------------------------
        # 5. Spatial alignment
        # --------------------------------------------

        aligner = SpatialAligner(
            self.optical_file,
            self.sar_file
        )

        sar_data, aligned_metadata = (
            aligner.align()
        )

        return {
            "optical": optical_data,
            "sar": sar_data,
            "metadata": aligned_metadata
        }