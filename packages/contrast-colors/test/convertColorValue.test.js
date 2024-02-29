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

import test from 'ava';
import {convertColorValue} from '../index.js';

test('should return color object for HSL color', (t) => {
  let result = convertColorValue('#2c66f1', 'HSL', true);
  t.deepEqual(result, {h: 222, s: 0.88, l: 0.56});
});

test('should return string format for HSL color', (t) => {
  let result = convertColorValue('#2c66f1', 'HSL');
  t.is(result, 'hsl(222deg, 88%, 56%)');
});

test('should return color object for RGB color', (t) => {
  let result = convertColorValue('#2c66f1', 'RGB', true);
  t.deepEqual(result, {r: 44, g: 102, b: 241});
});

test('should return string format for RGB color', (t) => {
  let result = convertColorValue('#2c66f1', 'RGB');
  t.is(result, 'rgb(44, 102, 241)');
});

test('should return color object for HEX color', (t) => {
  let result = convertColorValue('#2c66f1', 'HEX', true);
  t.deepEqual(result, {r: 44, g: 102, b: 241});
});

test('should return string format for HEX color', (t) => {
  let result = convertColorValue('#2c66f1', 'HEX');
  t.is(result, '#2c66f1');
});

test('should return color object for HSV color', (t) => {
  let result = convertColorValue('#2c66f1', 'HSV', true);
  t.deepEqual(result, {h: 222, s: 0.82, v: 0.95});
});

test('should return string format for HSV color', (t) => {
  let result = convertColorValue('#2c66f1', 'HSV');
  t.is(result, 'hsv(222deg, 82%, 95%)');
});

test('should return color object for HSLuv color', (t) => {
  let result = convertColorValue('#2c66f1', 'HSLuv', true);
  t.deepEqual(result, {l: 260, u: 91, v: 47});
});

test('should return string format for HSLuv color', (t) => {
  let result = convertColorValue('#2c66f1', 'HSLuv');
  t.is(result, 'hsluv(260, 91, 47)');
});

test('should return color object for LAB color', (t) => {
  let result = convertColorValue('#2c66f1', 'LAB', true);
  t.deepEqual(result, {l: 47, a: 32, b: -75});
});

test('should return string format for LAB color', (t) => {
  let result = convertColorValue('#2c66f1', 'LAB');
  t.is(result, 'lab(47%, 32, -75)');
});

test('should return color object for LCH color', (t) => {
  let result = convertColorValue('#2c66f1', 'LCH', true);
  t.deepEqual(result, {l: 47, c: 81, h: 293});
});

test('should return string format for LCH color', (t) => {
  let result = convertColorValue('#2c66f1', 'LCH');
  t.is(result, 'lch(47%, 81, 293deg)');
});

test('should return color object for CAM02 color', (t) => {
  let result = convertColorValue('#2c66f1', 'CAM02', true);
  t.deepEqual(result, {J: 48, a: -7, b: -35});
});

test('should return string format for CAM02 color', (t) => {
  let result = convertColorValue('#2c66f1', 'CAM02');
  t.is(result, 'jab(48%, -7, -35)');
});

test('should return color object for CAM02 (polar) color', (t) => {
  let result = convertColorValue('#2c66f1', 'CAM02p', true);
  t.deepEqual(result, {J: 36, C: 75, h: 258});
});

test('should return string format for CAM02 (polar) color', (t) => {
  let result = convertColorValue('#2c66f1', 'CAM02p');
  t.is(result, 'jch(36%, 75, 258deg)');
});

test('should throw error for missing output format', (t) => {
  t.throws(() => {
    let result = convertColorValue('rgb(0, 0, 0)');
  });
});

test('should throw error for missing color', (t) => {
  t.throws(() => {
    let result = convertColorValue('RGB');
  });
});

test('should throw error for incorrect argument order', (t) => {
  t.throws(() => {
    let result = convertColorValue('rgb', 'rgb(0, 0, 0)');
  });
});
