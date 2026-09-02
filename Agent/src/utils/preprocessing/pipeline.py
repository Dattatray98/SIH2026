from RasterReader import RasterReader
from NoDataHandler import NoDataHandler
from Normalizer import Normalizer
from ModelFormatter import ModelFormatter
from preprocessingConfig import PreprocessingConfig


class PreprocessingPipeline:

    def __init__(self, file, modality, config=None):

        self.file = file
        self.modality = modality.lower()
        self.config = config or PreprocessingConfig()

        self.config.validate()

    def run(self):

        # Read raster

        reader = RasterReader(self.file)

        data, metadata = reader.read()

        # Handle NoData

        nodata_handler = NoDataHandler(metadata["nodata"])

        nodata_result = nodata_handler.process(data)

        data = nodata_result["data"]

        # Normalize

        normalizer = Normalizer(self.modality)

        data = normalizer.normaalize(data)

        formatter = ModelFormatter(image_size=self.config.image_size)

        if self.modality == "optical":
            formatted = formatter.format_rgb(data)

        elif self.modality == "multispectral":
            formatted = formatter.format_multispectral(data)

        elif self.modality == "sar":
            formatted = formatter.format_sar(data)

        else:
            raise ValueError(f"Unsupported modality : {self.modality}")

        # return complete result

        return {
            "data": formatted["data"],
            "format": formatted["format"],
            "shape": formatted["shape"],
            "metadata": metadata,
            "nodata": {
                "pixels": nodata_result["nodata_pixels"],
                "total": nodata_result["total_pixels"],
            },
        }
