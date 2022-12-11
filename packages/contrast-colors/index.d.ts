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

export as namespace ContrastColors;
export = ContrastColors;

declare namespace ContrastColors {
  type InterpolationColorSpace = 'CAM02' | 'CAM02p' | 'LCH' | 'LAB' | 'HSL' | 'HSLuv' | 'RGB' | 'HSV';
  type ColorSpace = 'CAM02' | 'CAM02p' | 'LCH' | 'LAB' | 'HSL' | 'HSLuv' | 'RGB' | 'HSV' | 'HEX';
  
  type RGBArray = number[];
  
  type AdaptiveTheme = (brightness: number, constrast?: number) => AdaptiveTheme | ({ 
    background: string 
  } | {
    name: string,
    values: {
      name: string,
      contrast: number,
      value: string
    }[]
  })[];

  interface ColorScale {
    colorKeys: string[],
    colorSpace: ColorSpace,
    shift: number,
    colors: string[],
    scale: ((d: any) => string) | d3.ScaleLinear<number, number>,
    colorsHex: string[]
  }

  interface NamedColorScale {
    name: string,
    colorKeys: string[],
    colorSpace: InterpolationColorSpace,
    ratios: number[] | { [key: string]: number },
    smooth?: boolean
  }

  function createScale({
    swatches,
    colorKeys,
    colorSpace,
    shift,
    fullScale,
    smooth
  }: {
    swatches: number,
    colorKeys: string[],
    colorSpace?: InterpolationColorSpace,
    shift?: number,
    fullScale?: boolean,
    smooth?: boolean
  }): ColorScale | never;
  
  function luminance(r: number, g: number, b: number): number;
  
  function contrast(color: RGBArray, base: RGBArray, baseV: number): number;
  
  function binarySearch(list: number[], value: number, baseLum: number): number;
  
  function generateBaseScale({
    colorKeys,
    colorSpace,
    smooth
  }: {
    colorKeys: string[],
    colorSpace?: ColorSpace,
    smooth?: boolean
  }): string[];
  
  function generateContrastColors({
    colorKeys,
    base,
    ratios,
    colorSpace,
    smooth,
    output
  }: {
    colorKeys: string[],
    base: string,
    ratios: number[],
    colorSpace?: InterpolationColorSpace,
    smooth?: boolean,
    output?: ColorSpace
  }): string[] | never;
  
  function minPositive(r: number[]): number | never;
  
  function ratioName(r: number[]): number[] | never;
  
  function generateAdaptiveTheme({ 
    colorScales, 
    baseScale,
    brightness,
    contrast, 
    output
  }: {
    colorScales: NamedColorScale[],
    baseScale: string,
    brightness?: number,
    contrast?: number,
    output?: ColorSpace,
  }): AdaptiveTheme | never;
  
  function fixColorValue(
    color: string, 
    format: ColorSpace, 
    object?: boolean
  ): string | { [key: string]: number };
}