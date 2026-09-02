from raster_reader import RasterReader
from sensor_detector import SensorDetector
from band_mapper import BandMapper
from band_registry import BandRegistry
from nodata_handler import NoDataHandler
from normalizer import Normalizer
from model_formatter import ModelFormatter
from spatial_aligner import SpatialAligner
from config import PreprocessingConfig


class PreprocessingPipeline:

    def __init__(
        self,
        file,
        config=None
    ):

        self.file = file

        self.config = (
            config
            if config is not None
            else PreprocessingConfig()
        )

        self.config.validate()

    def detect_sensor(self):

        detector = SensorDetector(
            self.file
        )

        return detector.detect()

    def read(self):

        reader = RasterReader(
            self.file
        )

        return reader.read()

    def map_bands(self, sensor):

        mapper = BandMapper(
            self.file,
            sensor
        )

        return mapper.map()

    def handle_nodata(
        self,
        data,
        nodata
    ):

        handler = NoDataHandler(
            nodata
        )

        return handler.process(
            data
        )

    def normalize(
        self,
        data,
        modality
    ):

        normalizer = Normalizer(
            modality
        )

        return normalizer.normalize(
            data
        )

    def format(
        self,
        data,
        modality
    ):

        formatter = ModelFormatter(
            self.config.image_size
        )

        if modality == "optical":

            return formatter.format_rgb(
                data
            )

        elif modality == "multispectral":

            return formatter.format_multispectral(
                data
            )

        elif modality == "sar":

            return formatter.format_sar(
                data
            )

        raise ValueError(
            f"Unsupported modality: {modality}"
        )

    def process_single(self):

        # --------------------------------------------
        # 1. Detect sensor
        # --------------------------------------------

        sensor_info = self.detect_sensor()

        sensor = sensor_info["sensor"]
        modality = sensor_info["modality"]

        # --------------------------------------------
        # 2. Read raster
        # --------------------------------------------

        data, metadata = self.read()

        # --------------------------------------------
        # 3. Band mapping
        # --------------------------------------------

        band_mapping = None

        if sensor != "unknown":

            band_mapping = self.map_bands(
                sensor
            )

        # --------------------------------------------
        # 4. NoData handling
        # --------------------------------------------

        nodata_result = self.handle_nodata(
            data,
            metadata["nodata"]
        )

        data = nodata_result["data"]

        # --------------------------------------------
        # 5. Normalization
        # --------------------------------------------

        data = self.normalize(
            data,
            modality
        )

        # --------------------------------------------
        # 6. Model formatting
        # --------------------------------------------

        formatted = self.format(
            data,
            modality
        )

        return {
            "sensor": sensor_info,
            "bands": band_mapping,
            "data": formatted["data"],
            "format": formatted["format"],
            "shape": formatted["shape"],
            "metadata": metadata,
            "nodata": {
                "pixels": nodata_result["nodata_pixels"],
                "total": nodata_result["total_pixels"]
            }
        }