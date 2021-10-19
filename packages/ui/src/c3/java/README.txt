This directory contains Java code for processing raw color naming data and producing a color name model usable by applications. The Java binaries are included pre-compiled in the "bin" directory. 

The "build.sh" script will compile the Java source using javac.

The "model.sh" script will run the Java code to produce a color model. The default input data looked for by the program is "data/xkcd/xkcd.csv.gz". As output the program produces four files:

 c3_data.json - This is a JSON file containing the color name model
 colors.txt - The LAB triples for all binned colors
 terms.text - The names of each color in the model
 tally.txt - Counts for each color-term pair using a linearized index

The first file (c3_data.json) is used by the C3 JavaScript library. The other files are intermediate results used by the Java program. They are safe to delete, if desired.

--
December 2011 - Stanford University