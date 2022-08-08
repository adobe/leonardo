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

import { ratioName } from "../index";

test('should output 10 numbers incremented by 100', () => {
  const theme = ratioName([1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]);

  expect(theme).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
});

test('should output 10 numbers with first at 50', () => {
  const theme = ratioName([-1.5, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]);

  expect(theme).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
});
