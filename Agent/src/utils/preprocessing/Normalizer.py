import numpy as np


class Normalizer:

    def __init__(self, modality):
        self.modality = modality.lower()

        supported = ["optical", "multispectral", "sar"]

        if self.modality not in supported:
            raise ValueError(f"Unsupported modality: {modality}")

    def percentile_normalize(self, band, lower=2, upper=98):
        band = band.astype(np.float32)

        valid_pixels = band[np.isfinite(band)]

        if valid_pixels.size == 0:
            return np.zeros_like(band, dtype=np.float32)

        low = np.percentile(valid_pixels, lower)

        high = np.percentile(valid_pixels, upper)

        if high <= low:
            return np.zeros_like(band, dtype=np.float32)

        band = np.clip(band, low, high)

        band = (band - low) / (high - low)

        return band.astype(np.float32)

    def Normalize_optical(self, data):

        normalized = np.zeros_like(data, dtype=np.float32)

        for band in range(data.shape[0]):
            normalized[band] = self.percentile_normalize(data[band])

            return normalized

    def normalize_sar(self, data):

        normalized = np.zeros_like(data, dtype=np.float32)

        for band in range(data.shape[0]):

            normalized[band] = self.percentile_normalize(data[band])

        return normalized

    def normaalize(self, data):

        if data.ndim != 3:
            raise ValueError("Expected data with shape " "(bands, height, width)")

        if self.modality in ["optical", "multispectral"]:
            return self.normalize_optical(data)

        elif self.modality == "sar":
            return self.normalize_sar(data)
