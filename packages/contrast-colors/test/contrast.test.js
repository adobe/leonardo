
/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { contrast } = require('../index.cjs');

test('should provide negative contrast (-1.55...)', function() {
  let contrastValue = contrast([255, 255, 255], [207, 207, 207]); // white is UI color, gray is base. Should return negative whole number

  expect(contrastValue).toBe(-1.5579550563651177);
});

test('should provide positive contrast (1.55...)', function() {
  let contrastValue = contrast([207, 207, 207], [255, 255, 255]); // gray is UI color, white is base. Should return positive whole number

  expect(contrastValue).toBe(1.5579550563651177);
});
