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
import {minPositive} from '../index.js';

test('should return 1', (t) => {
  const result = minPositive([1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]);
  t.is(result, 1);
});

test('should return 2', (t) => {
  const result = minPositive([-3, -2, -1.2, 2, 3, 4.5, 6, 8, 12, 21]);
  t.is(result, 2);
});
