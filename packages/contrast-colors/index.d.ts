/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import type ChromaJs from 'chroma-js';

type ColorTuple = [number, number, number];

declare module 'chroma-js' {
  interface ChromaStatic {
    jch(...args: ColorTuple): ChromaJs.Color;
    jab(...args: ColorTuple): ChromaJs.Color;
    getCSSGradient(
      scale: Scale,
      /**
       * @default 1
       */
      length: number,
      /**
       * @default 90
       */
      deg: number,
      /**
       * @default .005
       */
      ε: number
    ): string;
  }
  interface Color {
    jch(): ColorTuple;
    jab(): ColorTuple;
    hsluv(): ColorTuple;
  }
}

/**
 * Supported colorspaces from the {@link https://www.w3.org/TR/css-color-4/ W3C CSS Color Module Level 4} spec.
 * @example '#RRGGBB' // HEX
 * @example 'rgb(255 255 255)' // RGB
 * @example 'hsl(360deg 0% 100%)' // HSL
 * @example 'hsv(360deg 0% 100%)' // HSV
 * @example 'hsluv(360 0 100)' // HSLuv
 * @example 'lab(100% 0 0)' // LAB
 * @example 'lch(100% 0 360deg)' // LCH
 * @example 'oklab(100% 0 0)' // OKLAB
 * @example 'oklch(100% 0 360deg)' // OKLCH
 * @example 'jab(100% 0 0)' // CAM02
 * @example 'jch(100% 0 360deg)' // CAM02p
 */
type Colorspace = 'HEX' | 'RGB' | 'HSL' | 'HSV' | 'HSLuv' | 'LAB' | 'LCH' | 'OKLAB' | 'OKLCH' | 'CAM02' | 'CAM02p';

/**
 * Supported interpolation colorspaces from the {@link https://www.w3.org/TR/css-color-4/ W3C CSS Color Module Level 4} spec.
 * @example 'rgb(255 255 255)' // RGB
 * @example 'hsl(360deg 0% 100%)' // HSL
 * @example 'hsv(360deg 0% 100%)' // HSV
 * @example 'hsluv(360 0 100)' // HSLuv
 * @example 'lab(100% 0 0)' // LAB
 * @example 'lch(100% 0 360deg)' // LCH
 * @example 'oklab(100% 0 0)' // OKLAB
 * @example 'oklch(100% 0 360deg)' // OKLCH
 * @example 'jab(100% 0 0)' // CAM02
 * @example 'jch(100% 0 360deg)' // CAM02p
 */
type InterpolationColorspace = Exclude<Colorspace, 'HEX'>;

type RGBArray = ColorTuple;

interface ColorBase {
  /**
   * User-defined name for a color, (eg "Blue"). Used to name output color values.
   */
  name: string;
  /**
   * List of specific colors to interpolate between in order to generate a full lightness scale of the color.
   * @remarks Strings are passed to {@link ChromaJs.valid}
   */
  colorKeys: CssColor[];
  /**
   * The colorspace in which the key colors will be interpolated.
   */
  colorspace?: InterpolationColorspace;
  /**
   * List of target contrast ratios, or object with named keys for each value.
   * @see {@link RatiosArray}, {@link RatiosObject}
   */
  ratios: RatiosArray | RatiosObject;
  /**
   * Applies bezier smoothing to interpolation.
   */
  smooth?: boolean;
  /**
   * Desired color output format.
   */
  output?: Colorspace;
  saturation?: number;
}

export class Color implements Required<ColorBase> {
  constructor({name, colorKeys, colorspace, ratios, smooth, output, saturation}: ColorBase);
  name: string;
  colorKeys: CssColor[];
  colorspace: InterpolationColorspace;
  ratios: RatiosArray | RatiosObject;
  smooth: boolean;
  output: Colorspace;
  saturation: number;
  readonly colorScale: ChromaJs.Scale;
}

export class BackgroundColor extends Color {
  readonly backgroundColorScale: ChromaJs.Scale;
}
/**
 * @see {@link https://www.w3.org/TR/WCAG22/#contrast-minimum}
 * @see {@link https://www.w3.org/TR/wcag-3.0/#visual-contrast-of-text}
 */
type ContrastFormula = 'wcag2' | 'wcag3';
type LightnessDistribution = 'linear' | 'polynomial';

/**
 * Helper function for rounding color values to whole numbers.
 */
export function convertColorValue(
  color: string,
  format: Colorspace,
  /** @default false */
  object?: boolean
): number;

export function createScale({
  swatches,
  colorKeys,
  colorspace,
  shift,
  fullScale,
  smooth,
  distributeLightness,
  sortColor,
  asFun
}?: {
  /** The number of swatches/steps in the scale. */
  swatches: number;
  colorKeys: CssColor[];
  /**
   * The colorspace used to interpolate the color scale.
   * @default 'LAB' */
  colorspace?: InterpolationColorspace;
  /** @default 1 */
  shift?: number;
  /** @default true */
  fullScale?: boolean;
  /** @default false */
  smooth?: boolean;
  /** @default 'linear' */
  distributeLightness?: LightnessDistribution;
  /** @default true */
  sortColor?: boolean;
  /** @default false */
  asFun?: boolean;
}): ChromaJs.Scale;

export function luminance(r: number, g: number, b: number): number;

export function contrast(
  color: RGBArray,
  base: RGBArray,
  baseV?: number,
  /** @default 'wcag2' */
  method?: ContrastFormula
): number;

interface UpdateColorOptions extends Partial<ColorBase> {
  /**
   * The current name of the color to be updated.
   */
  color: string;
  /**
   * A new name for the color.
   */
  name?: string;
}

export function minPositive(r: number[], formula: ContrastFormula): number;

export function ratioName(r: number[], formula: ContrastFormula): number[];

export class Theme implements Required<ThemeBase> {
  constructor({
    colors,
    backgroundColor,
    lightness,
    /**
     * @default 1
     */
    contrast,
    /**
     * @default 100
     */
    saturation,
    /**
     * @default 'HEX'
     */
    output,
    /** @default 'wcag2' */
    formula
  }: ThemeBase);

  colors: Color[];
  backgroundColor: BackgroundColor;
  lightness: number;
  contrast: number;
  output: Colorspace;
  saturation: number;
  formula: ContrastFormula;

  readonly backgroundColorValue: number;

  /**
   * Each color is an object named by user-defined value (eg `name: 'gray'`). `values` array consists of all generated color values for the color, with properties name, contrast, and value.
   * @example
   * [
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
   */
  readonly contrastColors: [ContrastColorBackground, ...ContrastColor[]];

  /**
   * Simplified format as an object of key-value pairs. Property is equal to the {@link RatiosArray generated} or {@link RatiosObject user-defined name} for each generated value.
   * @example {
   *   "gray100": "#e0e0e0",
   *   "gray200": "#a0a0a0",
   *   "gray300": "#808080",
   *   "gray400": "#646464",
   *   "blue100": "#b18cff",
   *   "blue200": "#8d63ff",
   *   "blue300": "#623aff",
   *   "blue400": "#1c0ad1"
   * }
   */
  readonly contrastColorPairs: Record<string, CssColor>;

  /**
   * All color values in a flat array.
   * @example [ "#e0e0e0", "#a0a0a0", "#808080", "#646464", "#b18cff", "#8d63ff", "#623aff", "#1c0ad1" ]
   */
  readonly contrastColorValues: CssColor[];

  /**
   * Add a {@link Color} to the theme
   * @example ```
   * const red = new Color({...})
   * theme.addColor = red;
   * ```
   */
  set addColor(arg: Color);
  /**
   * Remove a {@link Color} from an existing theme. Accepts an object with the Color's name and value, or by passing the Color class itself.
   * @example ```
   * // Remove via color name
    theme.removeColor = {name: 'Red'};
   * ```
   * @example ```
   * // Remove via Color class
   * const red = new Color({...})
   * theme.removeColor = red;
   * ```
   */
  set removeColor(arg: Color | {name: string});
  /**
   * Update a {@link Color} via its setters from the theme. Accepts an object with the name of the color you wish to modify, followed by the property and the new value you wish to modify.
   * @example ```
   * // Change the colors ratios
   * theme.updateColor = {name: 'red', ratios: [3, 4.5, 7]};
   * ```
   * @example ```
   * // Change the colors colorKeys
   * theme.updateColor = {name: 'red', colorKeys: ['#ff0000']};
   * ```
   * @example ```
   * // Change the color's name
   * theme.updateColor = {name: 'red', name: 'Crimson'};
   * ```
   */
  set updateColor(arg: UpdateColorOptions | UpdateColorOptions[]);
}

/**
 * When passing a flat array of target ratios, the output colors in your Theme will be generated by concatenating the color name (eg "Blue") with numeric increments. Colors with a positive contrast ratio with the base (ie, 2:1) will be named in increments of 100. For example, `gray100`, `gray200`.
 *
 * Colors with a negative contrast ratio with the base (ie -2:1) will be named in increments less than 100 and based on the number of negative values declared. For example, if there are 3 negative values `[-1.4, -1.3, -1.2, 1, 2, 3]`, the name for those values will be incremented by 100/4 (length plus one to avoid a `0` value), such as `gray25`, `gray50`, and `gray75`.
 * @example ```
 * new Color({
    name: 'blue',
    colorKeys: ['#5CDBFF', '#0000FF'],
    colorSpace: 'LCH',
    ratios: [3, 4.5]
  });
  // Returns:
  [
    {
      name: 'blue',
      values: [
        {name: "blue100", contrast: 3, value: "#8d63ff"},
        {name: "blue200", contrast: 4.5, value: "#623aff"}
      ]
    }
  ]
  ```
 */
type RatiosArray = number[];

/**
 * When defining ratios as an object with key-value pairs, you define what name will be output in your Leonardo theme.
 * @example ```
 * new Color({
    name: 'blue',
    colorKeys: ['#5CDBFF', '#0000FF'],
    colorSpace: 'LCH',
    ratios: {
      'blue--largeText': 3,
      'blue--normalText': 4.5
    }
  });
  // Returns:
  [
    {
      name: 'blue',
      values: [
        {name: "blue--largeText", contrast: 3, value: "#8d63ff"},
        {name: "blue--normalText", contrast: 4.5, value: "#623aff"}
      ]
    }
  ]
 * ```
 */
type RatiosObject = Record<string, number>;

interface ContrastColorBackground {
  background: CssColor;
}

interface ContrastColor {
  name: string;
  values: ContrastColorValue[];
}

interface ContrastColorValue {
  name: string;
  contrast: number;
  value: CssColor;
}

interface ThemeBase {
  /**
   * List of {@link Color} classes to generate theme colors for.
   */
  colors: Color[];
  /**
   * A single {@link BackgroundColor} class is required.
   */
  backgroundColor: BackgroundColor;
  /**
   * Value from 0-100 for desired lightness of generated theme background color (whole number).
   */
  lightness: number;
  /**
   * Multiplier to increase or decrease contrast for all theme colors.
   */
  contrast?: number;
  /**
   * Value from 0-100 for decreasing saturation of all theme colors.
   */
  saturation?: number;
  /**
   * Desired color output format.
   */
  output?: Colorspace;
  formula?: ContrastFormula;
}

/**
 * A valid CSS color.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color_value}
 */
type CssColor = RgbHexColor | RgbColor | HslColor | HsvColor | HsluvColor | LabColor | LchColor | OkLabColor | OkLchColor | Cam02Color | Cam02pColor | CssColorName;

/**
 * A string representing a CSS hexadecimal RGB color.
 * @example '#ff0000'
 * @example '#369'
 * @remarks Significantly more permissive than hex colors are, but probably the safest solution given the current limitations of Typescript's string literals.
 */
type RgbHexColor = `#${string}`;
/**
 * A CSS RGB color function.
 *  @example 'rgb(255 255 255)'
 */
type RgbColor = `rgb(${number} ${number} ${number})`;
/**
 * A CSS HSL color function.
 * @example 'hsl(360deg 0% 100%)'
 */
type HslColor = `hsl(${Degrees} ${Percent} ${Percent})`;

/**
 * @example 'hsv(360deg 0% 100%)'
 */
type HsvColor = `hsv(${Degrees} ${Percent} ${Percent})`;

/**
 * @example 'hsluv(360 0 100)'
 */
type HsluvColor = `hsluv(${number} ${number} ${number})`;

/**
 * @example 'lab(100% 0 0)'
 */
type LabColor = `lab(${Percent} ${number} ${number})`;

/**
 * @example 'lch(100% 0 360deg)'
 */
type LchColor = `lch(${Percent} ${number} ${Degrees})`;

/**
 * @example 'oklab(100% 0 0)'
 */
type OkLabColor = `oklab(${Percent} ${number} ${number})`;

/**
 * @example 'oklch(100% 0 360deg)'
 */
type OkLchColor = `oklch(${Percent} ${number} ${Degrees})`;

/**
 * @example 'jab(100% 0 0)'
 */
type Cam02Color = `jab(${Percent} ${number} ${number})`;

/**
 * @example 'jch(100% 0 360deg)'
 */
type Cam02pColor = `jch(${Percent} ${number} ${Degrees})`;
type Percent = `${number}%`;
type Degrees = `${number}deg`;

type CssColorName =
  | 'aliceblue'
  | 'antiquewhite'
  | 'aqua'
  | 'aquamarine'
  | 'azure'
  | 'beige'
  | 'bisque'
  | 'black'
  | 'blanchedalmond'
  | 'blue'
  | 'blueviolet'
  | 'brown'
  | 'burlywood'
  | 'cadetblue'
  | 'chartreuse'
  | 'chocolate'
  | 'coral'
  | 'cornflowerblue'
  | 'cornsilk'
  | 'crimson'
  | 'cyan'
  | 'darkblue'
  | 'darkcyan'
  | 'darkgoldenrod'
  | 'darkgray'
  | 'darkgreen'
  | 'darkgrey'
  | 'darkkhaki'
  | 'darkmagenta'
  | 'darkolivegreen'
  | 'darkorange'
  | 'darkorchid'
  | 'darkred'
  | 'darksalmon'
  | 'darkseagreen'
  | 'darkslateblue'
  | 'darkslategray'
  | 'darkslategrey'
  | 'darkturquoise'
  | 'darkviolet'
  | 'deeppink'
  | 'deepskyblue'
  | 'dimgray'
  | 'dimgrey'
  | 'dodgerblue'
  | 'firebrick'
  | 'floralwhite'
  | 'forestgreen'
  | 'fuchsia'
  | 'gainsboro'
  | 'ghostwhite'
  | 'goldenrod'
  | 'gold'
  | 'gray'
  | 'green'
  | 'greenyellow'
  | 'grey'
  | 'honeydew'
  | 'hotpink'
  | 'indianred'
  | 'indigo'
  | 'ivory'
  | 'khaki'
  | 'lavenderblush'
  | 'lavender'
  | 'lawngreen'
  | 'lemonchiffon'
  | 'lightblue'
  | 'lightcoral'
  | 'lightcyan'
  | 'lightgoldenrodyellow'
  | 'lightgray'
  | 'lightgreen'
  | 'lightgrey'
  | 'lightpink'
  | 'lightsalmon'
  | 'lightseagreen'
  | 'lightskyblue'
  | 'lightslategray'
  | 'lightslategrey'
  | 'lightsteelblue'
  | 'lightyellow'
  | 'lime'
  | 'limegreen'
  | 'linen'
  | 'magenta'
  | 'maroon'
  | 'mediumaquamarine'
  | 'mediumblue'
  | 'mediumorchid'
  | 'mediumpurple'
  | 'mediumseagreen'
  | 'mediumslateblue'
  | 'mediumspringgreen'
  | 'mediumturquoise'
  | 'mediumvioletred'
  | 'midnightblue'
  | 'mintcream'
  | 'mistyrose'
  | 'moccasin'
  | 'navajowhite'
  | 'navy'
  | 'oldlace'
  | 'olive'
  | 'olivedrab'
  | 'orange'
  | 'orangered'
  | 'orchid'
  | 'palegoldenrod'
  | 'palegreen'
  | 'paleturquoise'
  | 'palevioletred'
  | 'papayawhip'
  | 'peachpuff'
  | 'peru'
  | 'pink'
  | 'plum'
  | 'powderblue'
  | 'purple'
  | 'rebeccapurple'
  | 'red'
  | 'rosybrown'
  | 'royalblue'
  | 'saddlebrown'
  | 'salmon'
  | 'sandybrown'
  | 'seagreen'
  | 'seashell'
  | 'sienna'
  | 'silver'
  | 'skyblue'
  | 'slateblue'
  | 'slategray'
  | 'slategrey'
  | 'snow'
  | 'springgreen'
  | 'steelblue'
  | 'tan'
  | 'teal'
  | 'thistle'
  | 'tomato'
  | 'turquoise'
  | 'violet'
  | 'wheat'
  | 'white'
  | 'whitesmoke'
  | 'yellow'
  | 'yellowgreen';
