# d3-hsluv

This module implements the [HSLuv](http://www.hsluv.org/) (Hue, Saturation, Lightness) color space.


## Installing

If you use NPM, `npm install d3-hsluv`. AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3` global is exported:

```html
<script src="https://d3js.org/d3-color.v1.min.js"></script>
<script>

var yellow = d3.hsluv("yellow"); // {l: 85.9, u: 100, v: 97.1, opacity: 1}

</script>
```

[Try d3-hsluv in your browser.](https://tonicdev.com/npm/d3-hsluv)

## API Reference

<a name="hsluv" href="#hsluv">#</a> d3.<b>hsluv</b>(<i>l</i>, <i>u</i>, <i>v</i>[, <i>opacity</i>])<br>
<a href="#hsluv">#</a> d3.<b>hsluv</b>(<i>specifier</i>)<br>
<a href="#hsluv">#</a> d3.<b>hsluv</b>(<i>color</i>)<br>

Constructs a new [hsluv](http://www.hsluv.org/) color. The channel values are exposed as `l`, `u` and `v` properties on the returned instance.

If *l*, *u* and *v* are specified, these represent the channel values of the returned color; an *opacity* may also be specified. If a CSS Color Module Level 3 *specifier* string is specified, it is parsed and then converted to the hsluv color space. See [d3.color](https://github.com/d3/d3-color#color) for examples. If a [*color*](https://github.com/d3/d3-color#color) instance is specified, it is converted to the RGB color space using [*color*.rgb](https://github.com/d3/d3-color#color_rgb) and then converted to hsluv.

<a href="#interpolateHsluv">#</a> d3.<b>interpolateHsluv</b>(<i>a</i>, <i>b</i>) [<>](https://github.com/d3/d3-hsluv/blob/master/src/interpolateHsluv.js "Source")<br>

Returns an HSLuv color space interpolator between the two colors a and b. The colors a and b need not be in HSLuv; they will be converted to HSLuv using d3.hsluv. If either color’s hue or chroma is NaN, the opposing color’s channel value is used. The shortest path between hues is used. The return value of the interpolator is an RGB string.

<a href="#interpolateHsluvLong">#</a> d3.<b>interpolateHsluvLong</b>(<i>a</i>, <i>b</i>) [<>](https://github.com/d3/d3-hsluv/blob/master/src/interpolateHsluv.js "Source")<br>

Like interpolateHsluv, but does not use the shortest path between hues.
