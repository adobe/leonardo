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
/* global test, expect */

const { createScale } = require('../index');

test('should generate 8 colors in Lab', () => {
  const scale = createScale({ swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'LAB', shift: 1, fullScale: true });

  expect(scale).toEqual(
    [
      '#ffffff',
      '#c5e6a9',
      '#b6bba8',
      '#a591a6',
      '#9068a2',
      '#793d9d',
      '#5c0392',
      '#311048',
    ],
  );
});
