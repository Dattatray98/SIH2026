from src.preprocessing.validation.validation import TechnicalValidation, GeoSpatialValidation


file = r"/home/dattu/Documents/github/SatQuery_AI/data/S2A_MSIL2A_20170803T094031_N9999_R036_T34TCR_29_12.tif"
T = TechnicalValidation(file)

print(T.formatCheking())
print(T.FileCorruption())
print(T.BandsandDim())


G = GeoSpatialValidation(file)

print(G.CRS())
print(G.Resolution())