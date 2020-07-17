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

const { fixColorValue } = require('../index.js');

test('should return color object for HSL color', function() {
  let result = fixColorValue('#2c66f1', 'HSL', true);;

  expect(result).toEqual({ "h": 222, "s": 0.88, "l": 0.56});

});

test('should return string format for HSL color', function() {
  let result = fixColorValue('#2c66f1', 'HSL');;

  expect(result).toEqual('hsl(222deg, 88%, 56%)');

});


test('should return color object for RGB color', function() {
  let result = fixColorValue('#2c66f1', 'RGB', true);;

  expect(result).toEqual({ "r": 44, "g": 102, "b": 241});

});

test('should return string format for RGB color', function() {
  let result = fixColorValue('#2c66f1', 'RGB');;

  expect(result).toEqual('rgb(44, 102, 241)');

});


test('should return color object for HEX color', function() {
  let result = fixColorValue('#2c66f1', 'HEX', true);;

  expect(result).toEqual({ "r": 44, "g": 102, "b": 241});

});

test('should return string format for HEX color', function() {
  let result = fixColorValue('#2c66f1', 'HEX');;

  expect(result).toEqual('#2c66f1');

});

test('should return color object for HSV color', function() {
  let result = fixColorValue('#2c66f1', 'HSV', true);;

  expect(result).toEqual({ "h": 222, "s": 0.82, "v": 0.95});

});

test('should return string format for HSV color', function() {
  let result = fixColorValue('#2c66f1', 'HSV');;

  expect(result).toEqual('hsv(222deg, 82%, 95%)');

});


test('should return color object for HSLuv color', function() {
  let result = fixColorValue('#2c66f1', 'HSLuv', true);;

  expect(result).toEqual({ "l": 260, "u": 91, "v": 47});

});

test('should return string format for HSLuv color', function() {
  let result = fixColorValue('#2c66f1', 'HSLuv');;

  expect(result).toEqual('hsluv(260, 91, 47)');

});

test('should return color object for LAB color', function() {
  let result = fixColorValue('#2c66f1', 'LAB', true);;

  expect(result).toEqual({ "l": 46, "a": 22, "b": -77});

});

test('should return string format for LAB color', function() {
  let result = fixColorValue('#2c66f1', 'LAB');;

  expect(result).toEqual('lab(46%, 22, -77)');

});

test('should return color object for LCH color', function() {
  let result = fixColorValue('#2c66f1', 'LCH', true);;

  expect(result).toEqual({ "l": 46, "c": 80, "h": 286});

});

test('should return string format for LCH color', function() {
  let result = fixColorValue('#2c66f1', 'LCH');;

  expect(result).toEqual('lch(46%, 80, 286deg)');

});


test('should return color object for CAM02 color', function() {
  let result = fixColorValue('#2c66f1', 'CAM02', true);;

  expect(result).toEqual({ "J": 48, "a": -7, "b": -35});

});

test('should return string format for CAM02 color', function() {
  let result = fixColorValue('#2c66f1', 'CAM02');;

  expect(result).toEqual('jab(48%, -7, -35)');

});

test('should return color object for CAM02 (polar) color', function() {
  let result = fixColorValue('#2c66f1', 'CAM02p', true);;

  expect(result).toEqual({ "J": 35, "C": 75, "h": 258});

});

test('should return string format for CAM02 (polar) color', function() {
  let result = fixColorValue('#2c66f1', 'CAM02p');;

  expect(result).toEqual('jch(35%, 75, 258deg)');

});