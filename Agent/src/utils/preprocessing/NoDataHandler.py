import numpy as np


class NoDataHandler:

    def __init__(self, nodata=None):
        self.nodata = nodata

    def create_mask(self, data):

        mask = np.zeros(data.shape, dtype=bool)

        if np.issubdtype(data.dtype, np.floating):
            mask |= np.isnan(data)

        if np.issubdtype(data.dtype, np.number):
            mask |= np.isinf(data)

        if self.nodata is not None:
            mask |= data == self.nodata

        return mask

    def replace_nodata(self, data, fill_value=0):
        mask = self.create_mask(data)

        cleaned_data = data.astype(np.float32, copy=True)

        cleaned_data[mask] = fill_value

        return cleaned_data, mask

    def process(self, data):

        cleaned_data, mask = self.replace_nodata(data)

        return {
            "data": cleaned_data,
            "mask": mask,
            "nodata_pixels": int(mask.sum()),
            "total_pixels": int(mask.size),
        }
