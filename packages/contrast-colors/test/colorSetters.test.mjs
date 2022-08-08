/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/* global test, expect */
import { Color } from "../index";

test('should set color name of Color class', () => {
  const color = new Color({
    name: 'colorName',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5],
    smooth: true
  });

  color.name = 'newColorName'
  const colorName = color.name;

  expect(colorName).toEqual('newColorName');
});

test('should set color keys of Color class', () => {
  const color = new Color({
    name: 'colorName',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5],
    smooth: true
  });

  color.colorKeys = ['#ff00ff', '#ff32ff', '#320077']
  const colorKeys = color.colorKeys;

  expect(colorKeys).toEqual(['#ff00ff', '#ff32ff', '#320077']);
});

test('should set colorspace of Color class', () => {
  const color = new Color({
    name: 'colorName',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5],
    smooth: true
  });

  color.colorspace = 'HSL'
  const colorspace = color.colorspace;

  expect(colorspace).toEqual('HSL');
});

test('should set ratios of Color class', () => {
  const color = new Color({
    name: 'colorName',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5],
    smooth: true
  });

  color.ratios = [5, 7, 12]
  const ratios = color.ratios;

  expect(ratios).toEqual([5, 7, 12]);
});

test('should set smooth of Color class', () => {
  const color = new Color({
    name: 'colorName',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5],
    smooth: true
  });

  color.smooth = false;
  const smooth = color.smooth;

  expect(smooth).toEqual(false);
});