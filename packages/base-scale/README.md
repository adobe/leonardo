# `@adobe/leonardo-base-scale`

This package contains all the functions for generating a color scale using HSLuv lightness values.

## Using Leonardo

### Installing
```
npm i @adobe/leonardo-base-scale
```

Pass your colors and desired ratios. See additional options below.
```js
import { generateBaseScale } from '@adobe/leonardo-base-scale';

// returns hex value
let base = generateBaseScale({colorKeys: ["#cacaca"], colorspace: 'HSL'});
```

## API Reference

### generateBaseScale

This function is used to generate a color scale tailored specifically for use as a brightness scale when using Leonardo for brightness and contrast controls. Colors are generated that match HSLuv lightness values from `0` to `100` and are output as hex values.

```
generateBaseScale({colorKeys, colorspace})
```

**colorKeys** *[array]*: list of colors referenced to generate a lightness scale. Much like [key frames](https://en.wikipedia.org/wiki/Key_frame), key colors are single points by which additional colors will be interpolated between.

**colorspace** *string*: the colorspace in which the key colors will be interpolated within. Below are the available options:

- [Lch](https://en.wikipedia.org/wiki/HCL_color_space)
- [Lab](https://en.wikipedia.org/wiki/CIELAB_color_space)
- [CAM02](https://en.wikipedia.org/wiki/CIECAM02)
- [HSL](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [HSLuv](https://en.wikipedia.org/wiki/HSLuv)
- [HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)
- [RGB](https://en.wikipedia.org/wiki/RGB_color_space)

## D3 Color
This project is currently built using [D3 color](https://github.com/d3/d3-color). Although functionality is comparable to [Chroma.js](https://gka.github.io/chroma.js/), the choice of D3 color is based on the additional modules available for state-of-the-art [color appearance models](https://en.wikipedia.org/wiki/Color_appearance_model), such as [CIE CAM02](https://gramaz.io/d3-cam02/).

## Contributing
Contributions are welcomed! Read the [Contributing Guide](../../.github/CONTRIBUTING.md) for more information.

## Development

You can run tests and watch for changes with:

```sh
yarn dev
```

## Licensing
This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
