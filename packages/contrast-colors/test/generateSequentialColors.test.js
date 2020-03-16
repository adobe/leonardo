/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { generateSequentialColors } from '../index.js';

test('should output same input colors', function() {
  let colors = generateSequentialColors({
    swatches: 3,
    colorKeys: ['#FFB600', '#FF0049', '#1900BC'],
    colorspace: 'RGB',
    shift: 1,
    fullScale: false,
    correctLightness: false
  });

  expect(colors).toEqual(['#ffb600', '#ff0049', '#1900bc']);
});

test('should output 5 colors including same input colors', function() {
  let colors = generateSequentialColors({
    swatches: 5,
    colorKeys: ['#FFB600', '#FF0049', '#1900BC'],
    colorspace: 'LCH',
    shift: 1,
    fullScale: false,
    correctLightness: false
  });

  expect(colors).toEqual(['#ffb600', '#ff7425', '#ff0049', '#c80089', '#1900bc']);
});

test('should output 5 corrected colors with first & last matching input colors', function() {
  let colors = generateSequentialColors({
    swatches: 5,
    colorKeys: ['#FFB600', '#FF0049', '#1900BC'],
    colorspace: 'LCH',
    shift: 1,
    fullScale: false,
    correctLightness: true
  });

  expect(colors).toEqual(['#ffb600', '#ff6c29', '#fa0054', '#c0008f', '#1900bc']);
});

test('should output 10 corrected colors with first & last matching input colors', function() {
  let colors = generateSequentialColors({
    swatches: 10,
    colorKeys: ['#FFB600', '#FF0049', '#1900BC'],
    colorspace: 'LCH',
    shift: 1,
    fullScale: false,
    correctLightness: true
  });

  expect(colors).toEqual(['#ffb600', '#ff970f', '#ff7524', '#ff4e37', '#ff0a48', '#f20061', '#da007b', '#b50095', '#8000ac', '#1900bc']);
});

test('should return a sequential function', function() {
  let scale = generateSequentialColors({
    colorKeys: ['#FFB600', '#FF0049', '#1900BC'],
    colorspace: 'LCH',
    shift: 1,
    fullScale: false,
    correctLightness: true
  });
  let colors = scale(5);

  expect(colors).toEqual(['#ffb600', '#ff6c29', '#fa0054', '#c0008f', '#1900bc']);
});
