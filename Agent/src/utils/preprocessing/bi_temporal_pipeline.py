from raster_reader import RasterReader
from spatial_aligner import SpatialAligner
from nodata_handler import NoDataHandler
from normalizer import Normalizer


class BiTemporalPipeline:

    def __init__(
        self,
        image_t1,
        image_t2,
        config=None
    ):

        self.image_t1 = image_t1
        self.image_t2 = image_t2
        self.config = config

    def run(self):

        # --------------------------------------------
        # 1. Read reference image
        # --------------------------------------------

        reader_t1 = RasterReader(
            self.image_t1
        )

        t1_data, t1_metadata = (
            reader_t1.read()
        )

        # --------------------------------------------
        # 2. Read target image
        # --------------------------------------------

        reader_t2 = RasterReader(
            self.image_t2
        )

        t2_data, t2_metadata = (
            reader_t2.read()
        )

        # --------------------------------------------
        # 3. NoData handling
        # --------------------------------------------

        nodata_t1 = NoDataHandler(
            t1_metadata["nodata"]
        )

        nodata_t2 = NoDataHandler(
            t2_metadata["nodata"]
        )

        t1_result = nodata_t1.process(
            t1_data
        )

        t2_result = nodata_t2.process(
            t2_data
        )

        t1_data = t1_result["data"]
        t2_data = t2_result["data"]

        # --------------------------------------------
        # 4. Spatial alignment
        # --------------------------------------------

        aligner = SpatialAligner(
            self.image_t1,
            self.image_t2
        )

        t2_data, aligned_metadata = (
            aligner.align()
        )

        # --------------------------------------------
        # 5. Consistent normalization
        # --------------------------------------------

        normalizer = Normalizer(
            "multispectral"
        )

        t1_data = normalizer.normalize(
            t1_data
        )

        t2_data = normalizer.normalize(
            t2_data
        )

        return {
            "t1": t1_data,
            "t2": t2_data,
            "metadata": aligned_metadata
        }