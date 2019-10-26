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
 *  - Various revisions by Nathan Moroney of HP Labs
 * Version 0.3
 *  - Further cleanups and a function to return all of J,C,h,Q,M,s.
 * Version 0.2
 *  - Cleanup, added missing functions.
 * Version 0.1
 *  - Initial release.
 */

#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "ciecam02.h"


/**
 * Overall data structure for a CIECAM02 color
 */
struct CIECAM02color {
  double x, y, z;
  double J, C, h, H;
  double Q, M, s;
  double ac, bc;
  double as, bs;
  double am, bm;
};

/**
 * Overall data structure for CIECAM02 viewing conditions
 */
struct CIECAM02vc {
  double xw, yw, zw, aw;
  double la, yb;
  int surround;
  double n, z, f, c, nbb, nc, ncb, fl, d;
};


static double compute_n(struct CIECAM02vc theVC) {
  return(theVC.yb / theVC.yw);
}

static double compute_z(struct CIECAM02vc theVC) {
  return(1.48 + pow(theVC.n, 0.5));
}

static double compute_nbb(struct CIECAM02vc theVC) {
  return(0.725 * pow((1.0 / theVC.n), 0.2));
}

static double compute_fl(struct CIECAM02vc theVC) {
  double k, fl;
  k = 1.0 / ((5.0 * theVC.la) + 1.0);
  fl = 0.2 * pow(k, 4.0) * (5.0 * theVC.la) + 0.1 *
       (pow((1.0 - pow(k, 4.0)), 2.0)) *
       (pow((5.0 * theVC.la), (1.0 / 3.0)));
  return(fl);
}

static double calculate_fl_from_la_ciecam02( double la )
{
    double la5 = la * 5.0;
    double k = 1.0 / (la5 + 1.0);

    /* Calculate k^4. */
    k = k * k;
    k = k * k;

    return (0.2 * k * la5) + (0.1 * (1.0 - k)
                                  * (1.0 - k)
                                  * pow(la5, 1.0 / 3.0));
}

/**
 *              [  0.7328  0.4296  -0.1624 ]
 *    M_CAT02 = [ -0.7036  1.6975   0.0061 ]
 *              [  0.0030  0.0136   0.9834 ]
 *
 *              [  1.096124 -0.278869 0.182745 ]
 * M^-1_CAT02 = [  0.454369  0.473533 0.072098 ]
 *              [ -0.009628 -0.005698 1.015326 ]
 */
static void xyz_to_cat02( double *r, double *g, double *b,
                          double x, double y, double z )
{
    *r = ( 0.7328 * x) + (0.4296 * y) - (0.1624 * z);
    *g = (-0.7036 * x) + (1.6975 * y) + (0.0061 * z);
    *b = ( 0.0030 * x) + (0.0136 * y) + (0.9834 * z);
}

static void cat02_to_xyz( double *x, double *y, double *z,
                          double r, double g, double b )
{
    *x = ( 1.096124 * r) - (0.278869 * g) + (0.182745 * b);
    *y = ( 0.454369 * r) + (0.473533 * g) + (0.072098 * b);
    *z = (-0.009628 * r) - (0.005698 * g) + (1.015326 * b);
}

static void hpe_to_xyz( double *x, double *y, double *z,
                        double r, double g, double b )
{
    *x = (1.910197 * r) - (1.112124 * g) + (0.201908 * b);
    *y = (0.370950 * r) + (0.629054 * g) - (0.000008 * b);
    *z = b;
}

static void cat02_to_hpe( double *rh, double *gh, double *bh,
                          double r, double g, double b )
{
    *rh = ( 0.7409792 * r) + (0.2180250 * g) + (0.0410058 * b);
    *gh = ( 0.2853532 * r) + (0.6242014 * g) + (0.0904454 * b);
    *bh = (-0.0096280 * r) - (0.0056980 * g) + (1.0153260 * b);
}

/**
 * Theoretically, D ranges from
 *     0 = no adaptation to the adopted white point,
 *  to 1 = complete adaptation to the adopted white point.
 * In practice, the minimum D value will not be less than 0.65 for a
 * dark surround and exponentially converges to 1 for average surrounds
 * with increasingly large values of L_A.
 *
 * L_A is the luminance of the adapting field in cd/m^2.
 */
static double compute_d(struct CIECAM02vc theVC)
{
    return (theVC.f * (1.0 - ((1.0 / 3.6) * exp((-theVC.la - 42.0) / 92.0))));
}

static double nonlinear_adaptation( double c, double fl )
{
    double p = pow( (fl * c) / 100.0, 0.42 );
    return ((400.0 * p) / (27.13 + p)) + 0.1;
}

static double inverse_nonlinear_adaptation( double c, double fl )
{
    return (100.0 / fl) * pow( (27.13 * fabs( c - 0.1 )) / (400.0 - fabs( c - 0.1 )), 1.0 / 0.42 );
}

static double achromatic_response_to_white( struct CIECAM02vc theVC ) {
    double r, g, b;
    double rc, gc, bc;
    double rp, gp, bp;
    double rpa, gpa, bpa;

    xyz_to_cat02( &r, &g, &b, theVC.xw, theVC.yw, theVC.zw );

    rc = r * (((theVC.yw * theVC.d) / r) + (1.0 - theVC.d));
    gc = g * (((theVC.yw * theVC.d) / g) + (1.0 - theVC.d));
    bc = b * (((theVC.yw * theVC.d) / b) + (1.0 - theVC.d));

    cat02_to_hpe( &rp, &gp, &bp, rc, gc, bc );

    rpa = nonlinear_adaptation( rp, theVC.fl );
    gpa = nonlinear_adaptation( gp, theVC.fl );
    bpa = nonlinear_adaptation( bp, theVC.fl );

    return ((2.0 * rpa) + gpa + ((1.0 / 20.0) * bpa) - 0.305) * theVC.nbb;
}

struct CIECAM02color forwardCIECAM02(struct CIECAM02color theColor,
    struct CIECAM02vc theVC, int theVerbose, FILE *theFile) {
  double r, g, b;
  double rw, gw, bw;
  double rc, gc, bc;
  double rp, gp, bp;
  double rpa, gpa, bpa;
  double a, ca, cb;
  double et, t, temp;

  xyz_to_cat02( &r , &g , &b , theColor.x, theColor.y, theColor.z );
  xyz_to_cat02( &rw, &gw, &bw, theVC.xw, theVC.yw, theVC.zw );

  rc = r * (((theVC.yw * theVC.d) / rw) + (1.0 - theVC.d));
  gc = g * (((theVC.yw * theVC.d) / gw) + (1.0 - theVC.d));
  bc = b * (((theVC.yw * theVC.d) / bw) + (1.0 - theVC.d));

  cat02_to_hpe( &rp, &gp, &bp, rc, gc, bc );

  rpa = nonlinear_adaptation( rp, theVC.fl );
  gpa = nonlinear_adaptation( gp, theVC.fl );
  bpa = nonlinear_adaptation( bp, theVC.fl );

  ca = rpa - ((12.0 * gpa) / 11.0) + (bpa / 11.0);
  cb = (1.0 / 9.0) * (rpa + gpa - (2.0 * bpa));

  theColor.h = (180.0 / M_PI) * atan2( cb, ca );
  if( theColor.h < 0.0 ) theColor.h += 360.0;

  if (theColor.h < 20.14) {
    temp = ((theColor.h + 122.47)/1.2) + ((20.14 - theColor.h)/0.8);
    theColor.H = 300 + (100*((theColor.h + 122.47)/1.2)) / temp;
  }
  else if (theColor.h < 90.0) {
    temp = ((theColor.h - 20.14)/0.8) + ((90.00 - theColor.h)/0.7);
    theColor.H = (100*((theColor.h - 20.14)/0.8)) / temp;
  }
  else if (theColor.h < 164.25) {
    temp = ((theColor.h - 90.00)/0.7) + ((164.25 - theColor.h)/1.0);
    theColor.H = 100 + ((100*((theColor.h - 90.00)/0.7)) / temp);
  }
  else if (theColor.h < 237.53) {
    temp = ((theColor.h - 164.25)/1.0) + ((237.53 - theColor.h)/1.2);
    theColor.H = 200 + ((100*((theColor.h - 164.25)/1.0)) / temp);
  }
  else {
    temp = ((theColor.h - 237.53)/1.2) + ((360 - theColor.h + 20.14)/0.8);
    theColor.H = 300 + ((100*((theColor.h - 237.53)/1.2)) / temp);
  }

  a = ((2.0 * rpa) + gpa + ((1.0 / 20.0) * bpa) - 0.305) * theVC.nbb;

  theColor.J = 100.0 * pow( a / theVC.aw, theVC.c * theVC.z );

  et = (1.0 / 4.0) * (cos(((theColor.h * M_PI) / 180.0) + 2.0) + 3.8);
  t = ((50000.0 / 13.0) * theVC.nc * theVC.ncb * et * sqrt((ca*ca) + (cb*cb))) /
       (rpa + gpa + (21.0/20.0)*bpa);

  theColor.C = pow( t, 0.9 ) * sqrt( theColor.J / 100.0 )
                       * pow( 1.64 - pow( 0.29, theVC.n ), 0.73 );

  theColor.Q = ( 4.0 / theVC.c ) * sqrt( theColor.J / 100.0 ) *
		( theVC.aw + 4.0 ) * pow( theVC.fl, 0.25 );

  theColor.M = theColor.C * pow( theVC.fl, 0.25 );

  theColor.s = 100.0 * sqrt( theColor.M / theColor.Q );

  theColor.ac = theColor.C * cos((theColor.h * M_PI) / 180.0);
  theColor.bc = theColor.C * sin((theColor.h * M_PI) / 180.0);

  theColor.am = theColor.M * cos((theColor.h * M_PI) / 180.0);
  theColor.bm = theColor.M * sin((theColor.h * M_PI) / 180.0);

  theColor.as = theColor.s * cos((theColor.h * M_PI) / 180.0);
  theColor.bs = theColor.s * sin((theColor.h * M_PI) / 180.0);

  if (theVerbose == 1) {
    fprintf (theFile, "r=%lf g=%lf b=%lf\n", r, g, b);
    fprintf (theFile, "rw=%lf gw=%lf bw=%lf\n", rw, gw, bw);
    fprintf (theFile, "rc=%lf gc=%lf bc=%lf\n", rc, gc, bc);
    fprintf (theFile, "rp=%lf gp=%lf bp=%lf\n", rp, gp, bp);
    fprintf (theFile, "rpa=%lf gpa=%lf bpa=%lf\n", rpa, gpa, bpa);
    fprintf (theFile, "a=%lf b=%lf\n", ca, cb);
    fprintf (theFile, "a=%lf\n", a);
    fprintf (theFile, "h=%lf\n", theColor.h);
    fprintf (theFile, "J=%lf\n", theColor.J);
    fprintf (theFile, "et=%lf\n", et);
    fprintf (theFile, "t=%lf\n", t);
    fprintf (theFile, "C=%lf\n", theColor.C);
    fprintf (theFile, "Q=%lf\n", theColor.Q);
    fprintf (theFile, "M=%lf\n", theColor.M);
    fprintf (theFile, "s=%lf\n", theColor.s);
    fprintf (theFile, "ac=%lf bc=%lf\n", theColor.ac, theColor.bc);
    fprintf (theFile, "am=%lf bm=%lf\n", theColor.am, theColor.bm);
    fprintf (theFile, "as=%lf bs=%lf\n", theColor.as, theColor.bs);
    fprintf (theFile, "H=%lf\n\n", theColor.H);
  }

  return(theColor);
}

static void Aab_to_rgb( double *r, double *g, double *b, double A, double aa,
                        double bb, double nbb )
{
    double x = (A / nbb) + 0.305;

    /*       c1              c2               c3       */
    *r = (0.32787 * x) + (0.32145 * aa) + (0.20527 * bb);
    /*       c1              c4               c5       */
    *g = (0.32787 * x) - (0.63507 * aa) - (0.18603 * bb);
    /*       c1              c6               c7       */
    *b = (0.32787 * x) - (0.15681 * aa) - (4.49038 * bb);
}

struct CIECAM02color inverseCIECAM02(struct CIECAM02color theColor,
    struct CIECAM02vc theVC, int theVerbose, FILE *theFile) {
  double r, g, b;
  double rw, gw, bw;
  double rc, gc, bc;
  double rp, gp, bp;
  double rpa, gpa, bpa;
  double a, ca, cb;
  double et, t;
  double p1, p2, p3, p4, p5, hr;
  double tx, ty, tz;

  xyz_to_cat02( &rw, &gw, &bw, theVC.xw, theVC.yw, theVC.zw );

  t = pow(theColor.C / (sqrt(theColor.J / 100.0) * pow(1.64-pow(0.29, theVC.n), 0.73)), (1.0 / 0.9));
  et = (1.0 / 4.0) * (cos(((theColor.h * M_PI) / 180.0) + 2.0) + 3.8);

  a = pow( theColor.J / 100.0, 1.0 / (theVC.c * theVC.z) ) * theVC.aw;

  p1 = ((50000.0 / 13.0) * theVC.nc * theVC.ncb) * et / t;
  p2 = (a / theVC.nbb) + 0.305;
  p3 = 21.0 / 20.0;

  hr = (theColor.h * M_PI) / 180.0;

  if (fabs(sin(hr)) >= fabs(cos(hr))) {
    p4 = p1 / sin(hr);
    cb = (p2 * (2.0 + p3) * (460.0 / 1403.0)) /
	 (p4 + (2.0 + p3) * (220.0 / 1403.0) *
	 (cos(hr) / sin(hr)) - (27.0 / 1403.0) +
	 p3 * (6300.0 / 1403.0));
    ca = cb * (cos(hr) / sin(hr));
  }
  else {
    p5 = p1 / cos(hr);
    ca = (p2 * (2.0 + p3) * (460.0 / 1403.0)) /
         (p5 + (2.0 + p3) * (220.0 / 1403.0) -
         ((27.0 / 1403.0) - p3 * (6300.0 / 1403.0)) *
         (sin(hr) / cos(hr)));
    cb = ca * (sin(hr) / cos(hr));
  }

  Aab_to_rgb( &rpa, &gpa, &bpa, a, ca, cb, theVC.nbb );

  rp = inverse_nonlinear_adaptation( rpa, theVC.fl );
  gp = inverse_nonlinear_adaptation( gpa, theVC.fl );
  bp = inverse_nonlinear_adaptation( bpa, theVC.fl );

  hpe_to_xyz( &tx, &ty, &tz, rp, gp, bp );
  xyz_to_cat02( &rc, &gc, &bc, tx, ty, tz );

  r = rc / (((theVC.yw * theVC.d) / rw) + (1.0 - theVC.d));
  g = gc / (((theVC.yw * theVC.d) / gw) + (1.0 - theVC.d));
  b = bc / (((theVC.yw * theVC.d) / bw) + (1.0 - theVC.d));

  cat02_to_xyz( &theColor.x, &theColor.y, &theColor.z, r, g, b );

  printf("this is a test.\n");

  if (theVerbose == 1) {
    fprintf (theFile, "t=%lf\n", t);
    fprintf (theFile, "et=%lf\n", et);
    fprintf (theFile, "A=%lf\n", a);
    fprintf (theFile, "a=%lf b=%lf\n", ca, cb);
    fprintf (theFile, "rpa=%lf gpa=%lf bpa=%lf\n", rpa, gpa, bpa);
    fprintf (theFile, "rp=%lf gp=%lf bp=%lf\n", rp, gp, bp);
    fprintf (theFile, "rc=%lf gc=%lf bc=%lf\n", rc, gc, bc);
    fprintf (theFile, "r=%lf g=%lf b=%lf\n", r, g, b);
    fprintf (theFile, "x=%lf y=%lf z=%lf\n\n", theColor.x, theColor.y, theColor.z);
  }

  return(theColor);
}


int main (int argc, char** argv) {

  int mode, verbose, setD, i, samples;
  char temp_char;

  struct CIECAM02vc myVC;
  struct CIECAM02color myColor;

  FILE *myViewingConditions, *myInput, *myOutput;

  if (argc != 7) {
    printf ("\n ciecam02 mode verbose setD in.vc in.dat out.dat\n\n");
    printf ("   mode - 0 for forward and 1 for inverse.\n");
    printf ("   verbose - 0 for off and 1 for on.\n");
    printf ("   setD - 0 for compute and 1 to force to 1.\n");
    printf ("   in.vc - Xw, Yw, Zw, La, Yb and surround.\n");
    printf ("     surrounds are 1 - average, 2 - dim, and 3 - dark.\n\n");
    exit(1);
  }
  else {
    mode    = atoi(argv[1]);
    verbose = atoi(argv[2]);
    setD    = atoi(argv[3]);
  }

  if ( ((myViewingConditions  = fopen(argv[4], "r") ) == NULL) ||
       ((myInput              = fopen(argv[5], "r") ) == NULL) ||
       ((myOutput             = fopen(argv[6], "w") ) == NULL) ) {
     printf ("\n\n Cant open one of the data files. Bailing...\n\n");
    exit(1);
  }

  /**
   * Read in and compute the parameters associated with the viewing conditions.
   */

  fscanf(myViewingConditions, "%lf", &myVC.xw);
  fscanf(myViewingConditions, "%lf", &myVC.yw);
  fscanf(myViewingConditions, "%lf", &myVC.zw);
  fscanf(myViewingConditions, "%lf", &myVC.la);
  fscanf(myViewingConditions, "%lf", &myVC.yb);
  fscanf(myViewingConditions, "%d", &myVC.surround);

  if (myVC.surround == 1) {
    /**
     * Average
     */
    myVC.f  = 1.00;
    myVC.c  = 0.69;
    myVC.nc = 1.00;
  }
  else if (myVC.surround == 2) {
    /**
     * Dim
     */
    myVC.f  = 0.90;
    myVC.c  = 0.59;
    myVC.nc = 0.90;
  }
  else if (myVC.surround == 3) {
    /**
     * Dark
     */
    myVC.f  = 0.800;
    myVC.c  = 0.525;
    myVC.nc = 0.800;
  }
  else {
    printf ("\n Invalid value for the surround. Exiting.\n\n");
    exit (1);
  }

  myVC.n   = compute_n(myVC);
  myVC.z   = compute_z(myVC);
  myVC.fl  = compute_fl(myVC);
  myVC.nbb = compute_nbb(myVC);
  myVC.ncb = myVC.nbb;
  myVC.d   = compute_d(myVC);
  myVC.aw  = achromatic_response_to_white(myVC);


  if (verbose == 1) {
    fprintf (myOutput, "xw=%lf yw=%lf zw=%lf\n", myVC.xw, myVC.yw, myVC.zw);
    fprintf (myOutput, "la=%lf\n", myVC.la);
    fprintf (myOutput, "yb=%lf\n", myVC.yb);
    fprintf (myOutput, "n=%lf\n", myVC.n);
    fprintf (myOutput, "z=%lf\n", myVC.z);
    fprintf (myOutput, "fl=%lf\n", myVC.fl);
    fprintf (myOutput, "nbb=%lf\n", myVC.nbb);
    fprintf (myOutput, "ncb=%lf\n", myVC.ncb);
    fprintf (myOutput, "surround=%d  f=%lf  c=%lf  nc=%lf\n", myVC.surround, myVC.f, myVC.c, myVC.nc);
    fprintf (myOutput, "d=%lf\n", myVC.d);
    fprintf (myOutput, "aw=%lf\n", myVC.aw);
  }

  samples = 0;
  while ( (temp_char = getc(myInput)) != EOF ) {
    if (temp_char == '\n') samples++;
  }
  fseek(myInput, 0, SEEK_SET);

  if (mode == 0) {
    for (i = 0; i < samples; i++) {
      fscanf (myInput, "%lf", &myColor.x);
      fscanf (myInput, "%lf", &myColor.y);
      fscanf (myInput, "%lf", &myColor.z);

      if(verbose == 1) fprintf (myOutput, "x=%lf y=%lf z=%lf\n", myColor.x, myColor.y, myColor.z);

      myColor = forwardCIECAM02(myColor, myVC, verbose, myOutput);

      fprintf (myOutput, "%lf %lf %lf\n", myColor.J, myColor.C, myColor.h);
    }
  }
  else if (mode == 1) {
    for (i = 0; i < samples; i++) {
      fscanf (myInput, "%lf", &myColor.J);
      fscanf (myInput, "%lf", &myColor.C);
      fscanf (myInput, "%lf", &myColor.h);

      if(verbose == 1) fprintf (myOutput, "J=%lf C=%lf h=%lf\n", myColor.J, myColor.C, myColor.h);

      myColor = inverseCIECAM02(myColor, myVC, verbose, myOutput);

      fprintf (myOutput, "%lf %lf %lf\n", myColor.x, myColor.y, myColor.z);
    }
  }

  fclose(myViewingConditions);
  fclose(myInput);
  fclose(myOutput);

  return (0);
}
