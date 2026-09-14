import rasterio as rio
import os
from pathlib import Path


class TechnicalValidation:
    def __init__(self, file):
        self.file = file

    def formatCheking(self):
        file_ext = Path(self.file).suffix
        print(f"recieved file {self.file} and it's extention is {file_ext}")

        if file_ext == ".tif" or file_ext == ".tiff":
            return "Valide file formate!"
        else:
            return "Incorrect File formate!"

    def FileCorruption(self):

        if os.path.getsize(self.file) == 0:
            print("file is curropted!")
        else:
            print("file exists!")

        with rio.open(self.file) as src:
            if src.driver != "GTiff":
                print("File is structurally not GeoTIFF")
                return False

            _ = src.read(masked=False)

        print("file is completely intact")
        return True

    def BandsandDim(self):
        with rio.open(self.file) as src:

            if 0 < src.count:
                print("file bands : ", src.count, "\nfile has valid bands")

            print(f"file Dimentions : width = {src.width}, height={src.height}")

        return True


class GeoSpatialValidation:
    def __init__(self, file):
        self.file = file

    def CRS(self):
        with rio.open(self.file) as src:
            bounds = src.bounds
            native_crs = src.crs

            print(f"Native cordinate reference system : {native_crs}")

            print(f"Native left/waste (X) : {bounds.left}")
            print(f"Native bottom/south (Y): {bounds.bottom}")
            print(f"Native right/east (X) : {bounds.right}")
            print(f"Native top/North (Y) : {bounds.top}")

        return {
            "left/Waste": bounds.left,
            "bottom/South": bounds.bottom,
            "right/East": bounds.right,
            "top/North": bounds.top,
        }

    def Resolution(self):
        with rio.open(self.file) as src:
            res_X, res_Y = src.res
            
            print(f"resolution : {res_X}, {res_Y}")

        return {"res_x ": res_X, "res_y": res_Y, "transform":src.transform}


class AnalysisReadiness:
    def __init__(self, file):
        self.file = file


    def PixelValidation(self):
        with rio.open(self.file) as src:
            nodata_val = src.nodata
            