# Contrast Tool
Generate colors based on a desired contrast ratio

### Project Goals
To make it easier for designers and engineers to leverage color science to create custom interpolations for a value scale, and to make it easier for designers and engineers to conform to [WCAG minimum contrast standards](https://www.w3.org/TR/WCAG21/#contrast-minimum) by using contrast ratio as the starting point, rather than a post-color-selection auditing process.

### How to use
1. Input foreground color
2. Input background color
3. Slide or input desired contrast ratio
4. Copy output RGB value

![Image showing Adobe contrast tool with color inputs, interpolated gradient, contrast ratio input, and demo of colors applied to text and a button.](https://git.corp.adobe.com/pages/nbaldwin/Contrast-Tool/AdobeContrastScreenshot.jpg)

### D3 Color
This project is currently built using [D3 color](https://github.com/d3/d3-color). Although functionality is comparable to [Chroma.js](https://gka.github.io/chroma.js/), the choice of D3 color is based on the additional modules available for state-of-the-art [color appearance models](https://en.wikipedia.org/wiki/Color_appearance_model), such as [CIE CAM02](https://gramaz.io/d3-cam02/).

### Contributing
Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing
This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
