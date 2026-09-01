class BandRegistry:

    SENSOR_BANDS = {
        "sentinel-2": {
            "blue": "B02",
            "green": "B03",
            "red": "B04",
            "nir": "B08",
            "swir1": "B11",
            "swir2": "B12",
        },
        "sentinel-1": {"vv": "VV", "vh": "VH"},
    }


    def __init__(self, sensor):
        self.sensor = sensor.lower()


    def get_bands(self):

        if self.sensor not in self.SENSOR_BANDS:
            raise ValueError(
                f"Unsupported sensor : {self.sensor}"
            )

        return self.SENSOR_BANDS[self.sensor]

    def get_band(self, band_name):

        bands = self.get_bands()

        band_name = band_name.lower()


        if band_name not in bands:
            raise ValueError(
                f"Band '{band_name}' is not available"
                f"for {self.sensor}"
            )

        return bands[band_name]

    def has_band(self, band_name):

        bands = self.get_bands()

        return band_name.lower() in bands


    def get_optical_bands(self):

        optical_bands = [
              "blue",
            "green",
            "red",
            "nir",
            "swir1",
            "swir2"
        ]

        return {
            band: self.get_band(band)
            for band in optical_bands
            if self.has_band(band)
        }

    def get_sar_bands(self):

        sar_bands = [
            "vv",
            "vh"
        ]

        return {
            band: self.get_band(band)
            for band in sar_bands
            if self.has_band(band)
        }

    