# d3-cam02 verification

Because CIECAM02 and CIECAM02-UCS color spaces require many complex and long
computations we wanted to verify that our implementation matches other libraries
that were verified to match psychophysical groundtruth data.

There are two verification scripts. One uses Billy Bigg's C implementation,
which Nathan Moroney from HP labs helped bugfix. The second uses the
colorspacious Python library.

To use the C implementation, use the provided Makefile commands. To change
colors, edit in.dat with new XYZ [0,100] colors.

To use the python implementation, just run ``checker.py`` after installing
colorspacious.

```
XYZ [0,100] colors within the default in.dat file
----------------------------------------------------
RGB: [0,0,0]       |:::| XYZ100: [0.0,0.0,0.0]
RGB: [50,50,50]    |:::| XYZ100: [3.03,3.19,3.47]
RGB: [100,100,100] |:::| XYZ100: [12.11,12.74,13.88]
RGB: [150,150,150] |:::| XYZ100: [28.99,30.5,33.21]
RGB: [200,200,200] |:::| XYZ100: [54.9,57.76,62.9]
RGB: [250,250,250] |:::| XYZ100: [90.86,95.59,104.1]
RGB: [255,255,255] |:::| XYZ100: [95.05,100.0,108.9]
RGB: [255,0,0]     |:::| XYZ100: [41.24,21.26,1.93]
```

Example XYZ100 in.dat formatted colors taken from above:
```
0.0 0.0 0.0
3.03 3.19 3.47
12.11 12.74 13.88
28.99 30.5 33.21
54.9 57.76 62.9
90.86 95.59 104.1
95.05 100.0 108.9
41.24 21.26 1.93
```
