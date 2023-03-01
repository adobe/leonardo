/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import type ChromaJs from 'chroma-js'

type Colorspace = 'CAM02' | 'CAM02p' | 'HEX' | 'HSL' | 'HSLuv' | 'HSV' | 'LAB' | 'LCH' | 'RGB' | 'OKLAB' | 'OKLCH'

type RGBArray = [number, number, number]

interface ColorBase {
  name: string
  /**
   * Colors to be validated by {@link ChromaJs.valid}
   */
  colorKeys: any[]
  colorspace?: Colorspace
  ratios: Ratios
  smooth?: boolean
  output?: Colorspace
  saturation?: number
}

export class Color implements Required<ColorBase> {
  constructor({ name, colorKeys, colorspace, ratios, smooth, output, saturation }: ColorBase)
  name: string
  colorKeys: any[]
  colorspace: Colorspace
  ratios: Ratios
  smooth: boolean
  output: Colorspace
  saturation: number
  readonly colorScale: ChromaJs.Scale
}

export class BackgroundColor extends Color {
  readonly backgroundColorScale: ChromaJs.Scale
}
type ColorLike = string | number | ChromaJs.Color
type ContrastFormula = 'wcag2' | 'wcag3'
type LightnessDistribution = 'linear' | 'polynomial'

/**
 * Helper function for rounding color values to whole numbers.
 */
export function convertColorValue(color: ColorLike, format: Colorspace,
  /** @default false */
  object?: boolean): number

export function createScale({ swatches, colorKeys, colorspace, shift, fullScale, smooth, distributeLightness, sortColor, asFun, }?: {
  /** The number of swatches in the scale. */
  swatches: number
  /** Colors passed to {@link chroma} */
  colorKeys: string[]
  /** @default 'LAB' */
  colorspace?: Colorspace
  /** @default 1 */
  shift?: number
  /** @default true */
  fullScale?: boolean
  /** @default false */
  smooth?: boolean
  /** @default 'linear' */
  distributeLightness?: LightnessDistribution
  /** @default true */
  sortColor?: boolean
  /** @default false */
  asFun?: boolean
}): ChromaJs.Scale


export function luminance(r: number, g: number, b: number): number

export function contrast(color: RGBArray, base: RGBArray, baseV?: number,
  /** @default 'wcag2' */
  method?: ContrastFormula): number

interface ContrastColor extends Color { background: ReturnType<typeof convertColorValue> }

interface UpdateColorOptions extends Partial<ColorBase> {
  /**
   * The current name of the color to be updated.
   */
  color: string
  /**
   * A new name for the color.
  */
  name?: string
}

export function minPositive(r: number[], formula: ContrastFormula): number

export function ratioName(r: number[], formula: ContrastFormula): number[]

export class Theme implements Required<ThemeBase> {
  constructor({ colors, backgroundColor,
    lightness,
    /** @default 1 */
    contrast,
    /** @default 100 */
    saturation,
    /** @default 'HEX' */
    output,
    /** @default 'wcag2' */
    formula }: ThemeBase)

  colors: Color[]
  backgroundColor: BackgroundColor
  lightness: number
  contrast: number
  output: Colorspace
  saturation: number
  formula: ContrastFormula

  readonly backgroundColorValue: number

  /**
   * Array to be populated with JSON objects for each color, including names & contrast values
   */
  readonly contrastColors: ContrastColor[]

  /*  Objext to be populated with flat list of all color values as named key-value pairs */
  readonly contrastColorPairs: ContrastColor

  /*  Array to be populated with flat list of all color values */
  readonly contrastColorValues: any[]

  /** Add individual new colors */
  set addColor(arg: Color)
  /** Remove individual colors */
  set removeColor(arg: Color)
  /**
   * Modify individual colors
   * @example ```
   * // changing the name of a color:
   * {color: 'blue', name: 'cerulean'}
   * ```
   */
  set updateColor(arg: UpdateColorOptions | UpdateColorOptions[])
}


type Ratios = number[] | Record<string, number>

interface ThemeBase {
  colors: Color[]
  backgroundColor: Color
  lightness: number
  contrast?: number
  saturation?: number
  output?: Colorspace
  formula?: ContrastFormula
}