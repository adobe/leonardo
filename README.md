# Adaptive Color
Generate colors based on a desired contrast ratio, while defining "color" as a value spectrum

### Project Goals
To make it easier for designers and engineers to leverage color science to create custom interpolations for a value scale, and to make it easier for designers and engineers to conform to [WCAG minimum contrast standards](https://www.w3.org/TR/WCAG21/#contrast-minimum) by using contrast ratio as the starting point, rather than a post-color-selection auditing process.

### How to use
1. Select a color
2. Add tint or shade if desired
2. Select background color
3. Slide or input desired contrast ratio
4. Copy output RGB value

![Image showing Adobe contrast tool with color inputs, interpolated gradient, contrast ratio input, and demo of colors applied to text and a button.](https://git.corp.adobe.com/pages/nbaldwin/Contrast-Tool/AdobeContrastScreenshot.jpg)

### On "Adaptive Color"
I've written about this concept in more detail at the following links. The goals of this project are to aid in fulfilling the tooling necessary to make adaptive color palettes available to designers and engineers.

[Part 1: Adaptive Color in Design Systems](https://medium.com/thinking-design/adaptive-color-in-design-systems-7bcd2e664fa0)
[Part 2: Introducing Adaptive Color Palettes](https://medium.com/thinking-design/introducing-adaptive-color-palettes-111b5842fc88)
[Part 3: Adaptive Color in Spectrum, Adobe's Design System](https://medium.com/thinking-design/adaptive-color-in-spectrum-adobes-design-system-feeeec89a2c7)

### Local setup
install dependencies `npm i`
run local server `python -m SimpleHTTPServer 8001`
open `http://localhost:8001`

### Why can't it output exact target ratios?
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

### D3 Color
This project is currently built using [D3 color](https://github.com/d3/d3-color). Although functionality is comparable to [Chroma.js](https://gka.github.io/chroma.js/), the choice of D3 color is based on the additional modules available for state-of-the-art [color appearance models](https://en.wikipedia.org/wiki/Color_appearance_model), such as [CIE CAM02](https://gramaz.io/d3-cam02/).

### Contributing
Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing
This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
