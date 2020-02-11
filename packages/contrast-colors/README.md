# `@adobe/leonardo-contrast-colors`

[![npm version](https://badge.fury.io/js/%40adobe%2Fleonardo-contrast-colors.svg)](https://badge.fury.io/js/%40adobe%2Fleonardo-contrast-colors)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@adobe/leonardo-contrast-colors) [![license](https://img.shields.io/github/license/adobe/leonardo)](https://github.com/adobe/leonardo/blob/master/LICENSE)  [![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-blueviolet)](https://github.com/adobe/leonardo/blob/master/.github/CONTRIBUTING.md) 

This package contains all the functions for generating colors by target contrast ratio.

## Using Leonardo

### Installing
```
npm i @adobe/leonardo-contrast-colors
```

Pass your colors and desired ratios. See additional options below.
```js
import { generateContrastColors } from '@adobe/leonardo-contrast-colors';

// returns rgb value
let colors = generateContrastColors({colorKeys: ["#ff00ff"], base: "#ffffff", ratios: [4.5]});
```

## API Reference

### generateContrastColors

Primary function used to generate colors based on target contrast ratios. Parameters are destructured and need to be explicitly called, such as `colorKeys: ["#f26322"]`.

```
generateContrastColors({colorKeys, base, ratios, colorspace})
```

**colorKeys** *[array]*: list of colors referenced to generate a lightness scale. Much like [key frames](https://en.wikipedia.org/wiki/Key_frame), key colors are single points by which additional colors will be interpolated between.

**base** *string*: references the color value that the color is to be generated from.

**ratios** *[array]*: list of numbers to be used as target contrast ratios.

**colorspace** *string*: the colorspace in which the key colors will be interpolated within. Below are the available options:

- [Lch](https://en.wikipedia.org/wiki/HCL_color_space)
- [Lab](https://en.wikipedia.org/wiki/CIELAB_color_space)
- [CAM02](https://en.wikipedia.org/wiki/CIECAM02)
- [HSL](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [HSLuv](https://en.wikipedia.org/wiki/HSLuv)
- [HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [RGB](https://en.wikipedia.org/wiki/RGB_color_space)


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
