# `@adobe/leonardo-contrast-colors`

[![npm version](https://badge.fury.io/js/%40adobe%2Fleonardo-contrast-colors.svg)](https://badge.fury.io/js/%40adobe%2Fleonardo-contrast-colors)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@adobe/leonardo-contrast-colors) [![license](https://img.shields.io/github/license/adobe/leonardo)](https://github.com/adobe/leonardo/blob/master/LICENSE)  [![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-blueviolet)](https://github.com/adobe/leonardo/blob/master/.github/CONTRIBUTING.md) 

This package contains all the functions for generating colors by target contrast ratio.

## Using Leonardo Contrast Colors

### Installing
```
npm i @adobe/leonardo-contrast-colors
```

Pass your colors and desired ratios. See additional options below.
```js
import { generateAdaptiveTheme } from '@adobe/leonardo-contrast-colors';

// returns theme colors as JSON
let myTheme = generateAdaptiveTheme({
  colorScales: [
    {
      name: 'gray',
      colorKeys: ['#cacaca'],
      colorspace: 'HSL',
      ratios: [1, 2, 3, 4.5, 8, 12]
    },
    {
      name: 'blue',
      colorKeys: ['#5CDBFF', '#0000FF'],
      colorspace: 'HSL',
      ratios: [3, 4.5]
    },
    {
      name: 'red',
      colorKeys: ['#FF9A81', '#FF0000'],
      colorspace: 'HSL',
      ratios: [3, 4.5]
    }
  ],
  baseScale: 'gray',
  brightness: 97
});
```

## API Reference

### generateAdaptiveTheme

Function used to create a fully adaptive contrast-based color palette/theme using Leonardo. Parameters are destructured and need to be explicitly called, such as `colorKeys: ["#f26322"]`. Parameters can be passed as a config JSON file for modularity and simplicity.

```js
generateAdaptiveTheme({colorScales, baseScale});              // returns function
generateAdaptiveTheme({colorScales, baseScale, brightness});  // returns color objects
```

Returned function:
```js
myTheme(brightness, contrast);
```

#### `colorScales` *[array of objects]*:
Each object contains the necessary parameters for [generating colors by contrast](#generateContrastColors) with the exception of the `name` parameter.

#### `baseScale` *string (enum)*:
String value matching the `name` of a `colorScales` object to be used as a [base scale](#generateBaseScale) (background color). This creates a scale of values from 0-100 in lightness, which is used for `brightness` parameter. Ie. `brightness: 90` returns the 90% lightness value of the base scale.

#### `name` *string*:
Unique name for each color scale. This value will be used for the output color keys, ie `blue100: '#5CDBFF'`

#### `brightness` *number*:
Optional value from 0-100 indicating the brightness of the base / background color. If undefined, `generateAdaptiveTheme` will return a function

#### `contrast` *integer*:
Optional value to increase contrast of your generated colors. This value is multiplied against all ratios defined for each color scale.

#### `output` *string (enum)*:
String value of the desired color space and output format for the generated colors. Output formats conform to the [W3C CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) spec for the supported options.

| Output option | Sample value |
|---------------|--------------|
| `'HEX'`  _(default)_ | `#RRGGBB` |
| `'RGB'`       | `rgb(255, 255, 255)` |
| `'HSL'`       | `hsl(360deg, 0%, 100%)` |
| `'HSV'`       | `hsv(360deg, 0%, 100%)` |
| `'HSLuv'`     | `hsluv(360, 0, 100)` |
| `'LAB'`       | `lab(100%, 0, 0)` |
| `'LCH'`       | `lch(100%, 0, 360deg)` |
| `'CAM02'`     | `jab(100%, 0, 0)`|
| `'CAM02p'`    | `jch(100%, 0, 360deg)` |


#### Function outputs and examples
The `generateAdaptiveTheme` function returns an array of color objects. Each key is named by concatenating the user-defined color name (above) with a numeric value.

Colors with a **positive contrast ratio** with the base (ie, 2:1) will be named in increments of 100. For example, `gray100`, `gray200`.

Colors with a **negative contrast ratio** with the base (ie -2:1) will be named in increments less than 100 and based on the number of negative values declared. For example, if there are 3 negative values `[-1.4, -1.3, -1.2, 1, 2, 3]`, the name for those values will be incremented by 100/4 (length plus one to avoid a `0` value), such as `gray25`, `gray50`, and `gray75`.

Here is an example output from a theme:
```js
[
  { background: "#e0e0e0" },
  {
    name: 'gray',
    values: [
      {name: "gray100", contrast: 1, value: "#e0e0e0"},
      {name: "gray200", contrast: 2, value: "#a0a0a0"},
      {name: "gray300", contrast: 3, value: "#808080"},
      {name: "gray400", contrast: 4.5, value: "#646464"}
    ]
  },
  {
    name: 'blue',
    values: [
      {name: "blue100", contrast: 2, value: "#b18cff"},
      {name: "blue200", contrast: 3, value: "#8d63ff"},
      {name: "blue300", contrast: 4.5, value: "#623aff"},
      {name: "blue400", contrast: 8, value: "#1c0ad1"}
    ]
  }
]
```

#### Examples
###### Creating your theme as a function
```js
let myPalette = {
  colorScales: [
    {
      name: 'gray',
      colorKeys: ['#cacaca'],
      colorspace: 'HSL',
      ratios: [1, 2, 3, 4.5, 8, 12]
    },
    {
      name: 'blue',
      colorKeys: ['#5CDBFF', '#0000FF'],
      colorspace: 'HSL',
      ratios: [3, 4.5]
    },
    {
      name: 'red',
      colorKeys: ['#FF9A81', '#FF0000'],
      colorspace: 'HSL',
      ratios: [3, 4.5]
    }
  ],
  baseScale: 'gray'
}

let myTheme = generateAdaptiveTheme(myPalette);

myTheme(95, 1.2) // outputs colors with background lightness of 95 and ratios increased by 1.2
```

###### Creating static instances of your theme
```js
// theme on light gray
let lightTheme = generateAdaptiveTheme(95);

// theme on dark gray with increased contrast
let darkTheme = generateAdaptiveTheme(20, 1.3);
```

###### Assigning output to CSS properties
```js
let varPrefix = '--';

// Iterate each color object
for (let i = 0; i < myTheme.length; i++) {
  // Iterate each value object within each color object
  for(let j = 0; j < myTheme[i].values.length; j++) {
    // output "name" of color and prefix
    let key = myTheme[i].values[j].name;
    let prop = varPrefix.concat(key);
    // output value of color
    let value = myTheme[i].values[j].value;
    // create CSS property with name and value
    document.documentElement.style
      .setProperty(prop, value);
  }
}
```

### generateContrastColors

Primary function used to generate colors based on target contrast ratios. Parameters are destructured and need to be explicitly called, such as `colorKeys: ["#f26322"]`.

```js
generateContrastColors({colorKeys, base, ratios, colorspace})
```

#### `colorKeys` *[array]*:
List of colors referenced to generate a lightness scale. Much like [key frames](https://en.wikipedia.org/wiki/Key_frame), key colors are single points by which additional colors will be interpolated between.

#### `base` *string*:
References the color value that the color is to be generated from.

#### `ratios` *[array]*:
List of numbers to be used as target contrast ratios.

#### `colorspace` *string*:
The colorspace in which the key colors will be interpolated within. Below are the available options:

- [Lch](https://en.wikipedia.org/wiki/HCL_color_space)
- [Lab](https://en.wikipedia.org/wiki/CIELAB_color_space)
- [CAM02](https://en.wikipedia.org/wiki/CIECAM02)
- [HSL](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [HSLuv](https://en.wikipedia.org/wiki/HSLuv)
- [HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [RGB](https://en.wikipedia.org/wiki/RGB_color_space)

### generateBaseScale

This function is used to generate a color scale tailored specifically for use as a brightness scale when using Leonardo for brightness and contrast controls. Colors are generated that match HSLuv lightness values from `0` to `100` and are output as hex values.

```js
generateBaseScale({colorKeys, colorspace})
```

Only accepts **colorKeys** and **colorspace** parameters, as defined above for [`generateContrastColors`](#generateContrastColors)


## Why are not all contrast ratios available?
You may notice the tool takes an input (target ratio) but most often outputs a contrast ratio slightly higher. This has to do with the available colors in the RGB color space, and the math associated with calculating these ratios.

For example let's look at blue and white.
Blue: rgb(0, 0, 255)
White: rgb(255, 255, 255)
Contrast ratio: **8.59**:1

If we change any one value in the RGB channel for either color, the ratio changes:
Blue: rgb(0, **1**, 255)
White: rgb(255, 255, 255)
Contrast ratio: **8.57**:1

If 8.58 is input as the target ratio with the starting color of blue, the output will not be exact. This is exaggerated by the various colorspace interpolations.

Since the WCAG requirement is defined as a *minimum contrast requirement*, it should be fine to generate colors that are a little *more* accessible than the minimum.

## D3 Color
This project is currently built using [D3 color](https://github.com/d3/d3-color). Although functionality is comparable to [Chroma.js](https://gka.github.io/chroma.js/), the choice of D3 color is based on the additional modules available for state-of-the-art [color appearance models](https://en.wikipedia.org/wiki/Color_appearance_model), such as [CIE CAM02](https://gramaz.io/d3-cam02/).

The `createScale()` function is basically a wrapper function for creating a d3 linear scale for colors, with a few enhancements that aid in the `generateContrastColors()` function.

The Leonardo web app leverages d3 for additional features such as generating 2d and 3d charts.

## Contributing
Contributions are welcomed! Read the [Contributing Guide](../../.github/CONTRIBUTING.md) for more information.

## Development

You can run tests and watch for changes with:

```sh
yarn dev
```

## Licensing
This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
