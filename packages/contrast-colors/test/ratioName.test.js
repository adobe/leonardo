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
import {ratioName} from '../index.js';

test('should output 10 numbers incremented by 100', (t) => {
  const theme = ratioName([1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]);
  t.deepEqual(theme, [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
});

test('should output 10 numbers with first at 50', (t) => {
  const theme = ratioName([-1.5, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]);
  t.deepEqual(theme, [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
});
