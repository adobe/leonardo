/**
 * Copyright (c) 2003 Billy Biggs <vektor@dumbterm.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Version 0.4
 *  - Various additional revisions by Nathan Moroney of HP Labs
 * Version 0.3
 *  - Further cleanups and a function to return all of J,C,h,Q,M,s.
 * Version 0.2
 *  - Cleanup, added missing functions.
 * Version 0.1
 *  - Initial release
 */

#ifndef CIECAM02_H_INCLUDED
#define CIECAM02_H_INCLUDED

/**
 * The following is an implementation of the forward and inverse
 * functions for XYZ to JCh values from CIECAM02, as well as a function
 * to return all of J, C, h, Q, M and s.  It has been tested against the
 * spreadsheet of example calculations posted by Mark D.  Fairchild on
 * his website (http://www.cis.rit.edu/fairchild/).
 *
 * This code should be used with XYZ values in 0 to 100, not 0 to 1 like
 * most of my other code uses.  For input from sRGB, I recommend that
 * you use these values: D65 whitepoint, 20% gray, La value of 4 cd/m^2
 * to correspond to an ambient illumination of 64 lux:
 *
 *  la = 4.0;
 *  yb = 20.0;
 *  xw = 95.05;
 *  yw = 100.00;
 *  zw = 108.88;
 *
 *  The f, c and nc parameters control the surround.  CIECAM02 uses
 *  these values for average (relative luminance > 20% of scene white),
 *  dim (between 0% and 20%), and dark (0%).  In general, use average
 *  for both input and output.
 *
 *  // Average
 *  f = 1.0; c = 0.690; nc = 1.0;
 *  // Dim
 *  f = 0.9; c = 0.590; nc = 0.95;
 *  // Dark
 *  f = 0.8; c = 0.525; nc = 0.8;
 *
 * J is the lightness.
 * C is the chroma.
 * h is the hue angle in 0-360.
 * Q is the brightness.
 * M is the colourfulness.
 * s is the saturation.
 */

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Forward transform from XYZ to CIECAM02 JCh.
 */
void xyz2jch_ciecam02( double *J, double *C, double *h,
                       double x, double y, double z,
                       double xw, double yw, double zw,
                       double yb, double la,
                       double f, double c, double nc );

/**
 * Inverse transform from CIECAM02 JCh to XYZ.
 */
void jch2xyz_ciecam02( double *x, double *y, double *z,
                       double J, double C, double h,
                       double xw, double yw, double zw,
                       double yb, double la,
                       double f, double c, double nc );

/**
 * This function is for analysis of all six major perceptual correlates
 * from CIECAM02.  If any of the pointers are 0 they will not be filled.
 */
void xyz2jchqms_ciecam02( double *J, double *C, double *h,
                          double *Q, double *M, double *s,
                          double x, double y, double z,
                          double xw, double yw, double zw,
                          double yb, double la,
                          double f, double c, double nc );


#ifdef __cplusplus
};
#endif
#endif /* CIECAM02_H_INCLUDED */
