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

import { minPositive } from "../index";

test('should return 1', () => {
  const result = minPositive([1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]);

  expect(result).toEqual(1);
});

test('should return 2', () => {
  const result = minPositive([-3, -2, -1.2, 2, 3, 4.5, 6, 8, 12, 21]);

  expect(result).toEqual(2);
});
