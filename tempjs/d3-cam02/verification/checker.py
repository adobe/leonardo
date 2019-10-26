'''Check CIECAM02-UCS quality through the colorspacious library.'''
import numpy as np
from colorspacious import cspace_convert

def printRgb2Cam02UCS(rgb):
    jab = cspace_convert(rgb, "sRGB255", "CAM02-UCS")
    jabStr = ','.join([str(np.round(c, decimals=2)) for c in jab])
    rgbStr = 'RGB: [' + ','.join([str(c) for c in rgb]) + ']'
    while len(rgbStr) < 18:
        rgbStr = rgbStr + ' '
    print rgbStr, '|:::| Jab (UCS): ['+jabStr+']'

def printRgb2Cam02(rgb):
    jch = cspace_convert(rgb, "sRGB255", "CIECAM02")
    jchStr = ','.join([str(np.round(c, decimals=2)) for c in jch])
    rgbStr = 'RGB: [' + ','.join([str(c) for c in rgb]) + ']'
    while len(rgbStr) < 18:
        rgbStr = rgbStr + ' '
    print rgbStr, '|:::| JCh: ['+jchStr+']'

def printRgb2XYZ100(rgb):
    xyz = cspace_convert(rgb, "sRGB255", "XYZ100")
    xyzStr = ','.join([str(np.round(c, decimals=2)) for c in xyz])
    rgbStr = 'RGB: [' + ','.join([str(c) for c in rgb]) + ']'
    while len(rgbStr) < 18:
        rgbStr = rgbStr + ' '
    print rgbStr, '|:::| XYZ100: ['+xyzStr+']'

# Print achromatic shift values
# for i in [0, 50, 100, 150, 200, 250, 255]:
#     printRgb2XYZ100([i,i,i])
#
# printRgb2XYZ100([255,0,0])

for i in [0, 50, 100, 150, 200, 250, 255]:
    printRgb2Cam02UCS([i,i,i])

printRgb2Cam02UCS([255,0,0])
printRgb2Cam02UCS([0,0,255])


print cspace_convert([2.683588, 2.065873, 0.403668], "XYZ100", "sRGB255")
