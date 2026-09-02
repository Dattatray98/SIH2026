import rasterio

class BandMapper:
    def __init__(self, file, sensor):
        self.file = file
        self.sensor = sensor.lower()


    def get_band_description(self):

        with rasterio.open(self.file) as src:

            description = {}

            for band_number in range(1,src.count+1):
                description = src.description[band_number - 1]

                description[band_number] = description

            return description


    def normalize_band_name(self, name):
        if name is None:
            return None

        name = str(name).strip().upper()

        return name.replace("-", "").replace("_","")

    def map_sentinel2(self, description):

        mapping = {}

        for band_number, description in description.items():

            normalized = self.normalize_band_name(
                description
            )

            if normalized in [
                "B01",
                "B02",
                "B03",
                "B04",
                "B05",
                "B06",
                "B07",
                "B08",
                "B8A",
                "B09",
                "B10",
                "B11",
                "B12"
            ]:

                mapping[band_number] = normalized

        return mapping


    def map_sentinel1(self, descriptions):

        mapping = {}

        for band_number, description in descriptions.items():

            normalized = self.normalize_band_name(
                description
            )

            if normalized in ["VV", "VH"]:

                mapping[band_number] = normalized

        return mapping

    def map(self):

        descriptions = self.get_band_descriptions()

        if self.sensor == "sentinel-2":

            mapping = self.map_sentinel2(
                descriptions
            )

        elif self.sensor == "sentinel-1":

            mapping = self.map_sentinel1(
                descriptions
            )

        else:

            mapping = {}

        return {
            "sensor": self.sensor,
            "bands": mapping,
            "unmapped_bands": [
                band
                for band in descriptions
                if band not in mapping
            ]
        }