# d3-cam02

To access the latest version of d3-cam02, grab it on
[unpkg](https://unpkg.com/d3-cam02).

This module extends D3's native color support to also include CIECAM02 color.
CIECAM02 is an updated color model that serves as an alternative to perceptually
modeled spaces like CIELAB and CIELCh.
One large difference compared to other perceptual color spaces is that it models
colors after transforming them through the CAT02 chromatic adaptation transform
which simulates responses from the eye's long, medium, and short cone responses
(LMS).
Both Jab and JCh assume average viewing conditions for the purposes of computing
CAM02 color.

Before using this library, note that Jab and JCh are not Cartesian/polar space
correlates of one another, because
**the J in CIECAM02's JCh and in CIECAM02-UCS's Jab are not equivalent**.
Jab is calculated via M.R. Luo and C. Li's uniform color space transform to
better approximate perceptual uniformity.
For an overview of CIECAM02, their transform, and comparisons to CIELAB, we
recommend Luo and Li's paper entitled "CIECAM02 and Its Recent Developments".

d3-cam02 follows the same rules as d3-color. For example, to get the
CIECAM02-UCS Jab representation of "steelblue":
```js
var c = d3.jab("steelblue"); // {r: 70, g: 130, b: 180, opacity: 1}
```

You can also define Jab or JCh colors directly:
```js
var c1 = d3.jab(80, 30, 10),
    c2 = d3.jch(50, 70, 270);
```

Just as in d3-color, you can also directly manipulate colors once they are
initialized:
```js
var c = d3.jab(80, 30, 10);
c.J += 5;
var hue = (180 / Math.PI) * Math.atan2(c.b, c.a);
c + ""; // transforms to RGB string formatting
```

## Installation
###

After downloading the repo, run ``npm install``, which will install any
dependencies. You can optionally install from npm opposed to cloning directly
from GitHub. Make sure to load d3-cam02 after d3-color.

**Dependencies:** [d3-color](https://github.com/d3/d3-color)

## API Reference
###

Because this package extends d3-color, previously available color functions
are similarly available in d3-cam02
(e.g., <em>color</em>.{rgb, brighter, darker, displayable}).

<a name="jab" href="#jab">#</a> d3.<b>jab</b>(<i>J</i>, <i>a</i>, <i>b</i>[, <i>opacity</i>]) [<>](https://github.com/connorgr/d3-cam02/blob/master/src/cam02.js#L404 "Source")<br>
<a href="#jab">#</a> d3.<b>jab</b>(<i>specifier</i>)<br>
<a href="#jab">#</a> d3.<b>jab</b>(<i>color</i>)<br>

Constructs a new CIECAM02-UCS Jab color. The channel values are exposed as J, a
and b properties on the returned instance. J refers to lightness, a refers to
redness-to-greenness, and b refers to blueness-to-yellowness.

If J, a, and b are specified, these represent the channel values of the returned
color; an opacity may also be specified. If a CSS Color Module Level 3 specifier
string is provided, it is parsed and then converted to the Lab color space. See
d3-color for examples. If a color instance is specified, it is converted to the
RGB color space using `color.rgb` and then converted to Jab. (Colors already in
the Jab color space skip the conversion to RGB.)

<a name="jch" href="#jch">#</a> d3.<b>jch</b>(<i>J</i>, <i>C</i>, <i>h</i>[, <i>opacity</i>]) [<>](https://github.com/connorgr/d3-cam02/blob/master/src/cam02.js#L328 "Source")<br>
<a href="#jch">#</a> d3.<b>jch</b>(<i>specifier</i>)<br>
<a href="#jch">#</a> d3.<b>jch</b>(<i>color</i>)<br>

Constructs a new CIECAM02 JCh color. The channel values are exposed as J, C, and
h properties on the returned instance. J refers to a lightness definition
different than d3.jab, C refers to chroma, and h refers to hue.
Jab transform's JCh lightness with the following transform:
``Jab.J = JCh.J / (1.0 + 0.007*(100.0 - JCh.J))``.

If J, C and h are specified, these represent the channel values of the returned
color; an opacity may also be specified. If a CSS Color Module Level 3 specifier
string is provided, it is parsed and then converted to the Lab color space. See
d3-color for examples. If a color instance is specified, it is converted to the
RGB color space using `color.rgb` and then converted to JCh. (Colors already in
the JCh color space skip the conversion to RGB.)
