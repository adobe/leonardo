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

import { createScale } from '../index.js';

test('should generate 8 colors in Lab', function() {
  let scale = createScale({swatches: 8, colorKeys: ['#CCFFA9', '#FEFEC5', '#5F0198'], colorspace: 'LAB', shift: 1, fullScale: true, smooth: false});

  expect(scale.colors).toEqual(
    [
      'rgb(255, 255, 255)',
      'rgb(196, 229, 169)',
      'rgb(181, 187, 168)',
      'rgb(163, 144, 166)',
      'rgb(143, 103, 162)',
      'rgb(120, 60, 157)',
      'rgb(92, 3, 146)',
      'rgb(49, 15, 72)'
    ]
  );

  expect(scale.colorKeys).toEqual(
    [ '#CCFFA9', '#FEFEC5', '#5F0198' ]
  );
});
