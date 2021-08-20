![Leonardo logo](.github/Leonardo_Logo.png)

[![npm version](https://badge.fury.io/js/%40adobe%2Fleonardo-contrast-colors.svg)](https://www.npmjs.com/package/@adobe/leonardo-contrast-colors)
[![Package size](https://badgen.net/packagephobia/publish/@adobe/leonardo-contrast-colors)](https://packagephobia.com/result?p=%40adobe%2Fleonardo-contrast-colors)
[![Minified size](https://badgen.net/bundlephobia/min/@adobe/leonardo-contrast-colors)](https://bundlephobia.com/package/@adobe/leonardo-contrast-colors)
[![Minified and gzipped size](https://badgen.net/bundlephobia/minzip/@adobe/leonardo-contrast-colors)](https://bundlephobia.com/package/@adobe/leonardo-contrast-colors)
[![license](https://img.shields.io/github/license/adobe/leonardo)](https://github.com/adobe/leonardo/blob/master/LICENSE)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-blueviolet)](https://github.com/adobe/leonardo/blob/master/.github/CONTRIBUTING.md) [![Web UI](https://img.shields.io/badge/web%20tool-leonardocolor.io-blue)](https://leonardocolor.io)

# Leonardo
Authoring [adaptive color palettes](#what-is-adaptive-color) for generating color based on a desired contrast ratio.

For a detailed walkthrough of Leonardo, [check out this article](https://medium.com/@NateBaldwin/leonardo-an-open-source-contrast-based-color-generator-92d61b6521d2).

## Project Goals
To make it easier for designers and engineers to leverage color science to create custom interpolations for a value scale, and to make it easier for designers and engineers to conform to [WCAG minimum contrast standards](https://www.w3.org/TR/WCAG21/#contrast-minimum) by using contrast ratio as the starting point, rather than a post-color-selection auditing process.

1. [Leonardo web application](#leonardo-web-application)
2. [Show me a demo](#show-me-a-demo)
3. [What is "adaptive color"?](#what-is-adaptive-color)
4. [Using Leonardo](#using-leonardo)
5. [Why are not all contrast ratios available?](#why-are-not-all-contrast-ratios-available)
6. [D3 Color](#d3-color)
7. [Contributing](#contributing)
8. [Licensing](#licensing)


## Leonardo web application
The [Leonardo web application](http://www.leonardocolor.io/) is a tool for designers and engineers to collaboratively build color scales for use in user interfaces. The tool exposes an interface to `@adobe/leonardo-contrast-colors`'s `generateContrastColors()` function and displays visual aids for modifying the selection of a variable color and the target contrast ratios (swatches) to produce. The URL updates with your parameters for easily sharing links to team mates, and the app displays the specific config parameters when designers send you a version that they approve.

![Leonardo web app with color inputs, interpolated gradient, contrast ratio input, and demo of colors applied to text and a button.](.github/Leonardo_Screenshot.png)

## Show me a demo
Sometimes it's easier to express what you can do by showing you. Take a look at [this demo app](http://www.leonardocolor.io/demo.html) and play around with the brightness and contrast controls.

The controls are used to dynamically regenerate the entire UI color palette using `generateContrastColors()` functions as the end user (you) adjusts their settings. All of the changes to the UI colors are in conformity with the parameters set up by designers in the Leonardo web application ensuring that end users have the flexibility and control that they need while still upholding the design team's color choices.

## What is adaptive color?
I've written about this concept in more detail at the following links. The goals of this project are to aid in fulfilling the tooling necessary to make adaptive color palettes available to designers and engineers.

- [Part 1: Adaptive Color in Design Systems](https://medium.com/thinking-design/adaptive-color-in-design-systems-7bcd2e664fa0)
- [Part 2: Introducing Adaptive Color Palettes](https://medium.com/thinking-design/introducing-adaptive-color-palettes-111b5842fc88)
- [Part 3: Adaptive Color in Spectrum, Adobe's Design System](https://medium.com/thinking-design/adaptive-color-in-spectrum-adobes-design-system-feeeec89a2c7)

## Using Leonardo

See the [`@adobe/leonardo-contrast-colors` README](packages/contrast-colors/README.md) for details on how to use Leonardo in your app.

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
Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Development

To get started [developing Leonardo UI](packages/ui#development):

*Note: [Yarn](https://yarnpkg.com/) must be installed on your machine*

```sh
# Install dependencies
yarn install

# Change directory to Leonardo UI
cd packages/ui

# Run local server
yarn dev
```

To get started [developing Leonardo `contrast-colors` package](packages/contrast-colors#development):

```sh
# From root, change directory to contrast-colors
cd packages/contrast-colors

# Run tests and watch for changes
yarn dev
```

Then, visit the live reloading web UIs here:
http://localhost:1234/index.html
http://localhost:1234/demo.html

## Licensing
This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
