from pathlib import Path
import rasterio




class ModalityDetector:
    def __init__(self, file):
        self.file = Path(file)

    def get_band_information(self):

        with rasterio.open(self.file) as src:
            bands = []

            for band_number in range(1, src.count + 1):
                band = src.read(band_number)

                bands.append({
                    "band":band_number,
                    "dtype":str(src.dtype[band_number - 1]),
                    "min":float(band.min()),
                    "max":float(band.max()),
                    "mean":float(band.mean()),
                    "std":float(band.std())
                })


            return bands

    def detect_from_band_count(self):
        with rasterio.open(self.file) as src:
            count = src.count

            if count == 1:
                return "SINGLE_BAND"

            elif 3 <= count <= 4:
                return "OPTICAL"

            elif count >= 5:
                return "MULTISPECTRAL"

            return "UNKNOWN"


    def detect(self):
        result = {
            "modality":"UNKNOWN",
            "confidence":0.0,
            "evidence" : []
        }

        try:
            with rasterio.open(self.file) as src:

                band_count = src.count
                dtype = src.dtypes[0]

                result["evidence"].append(
                    f"Raster contains {band_count} band(s)"
                )

                result["evidence"].append(
                    f"Raster dtype is {dtype}"
                )

                if band_count == 1:
                    result["modality"] = "SINGLE_BAND"

                    result["confidence"] = 0.60

                    result['evidence'].append(
                        "Single-band imagery may represent SAR, DEM, or antoher single-band product"
                    )

                elif band_count in [3,4]:
                    result["modality"] = "OPTICAL"
                    result["confidence"] = 0.80

                    result["evidence"].append(
                        "3-4 bands are consistent with optical imagery"
                    )

                elif band_count >=5:
                    result["modality"] = "MULTISPECTRAL"
                    result["confidence"]= 0.85

                    result["evidence"].append(
                        "Multiple spectral band are consistant with multispectral imagery"
                    )

        except Exception as e :

            result["evidence"].append(
                f"Modality detection failed : {str(e)}"
            )


        return result
    