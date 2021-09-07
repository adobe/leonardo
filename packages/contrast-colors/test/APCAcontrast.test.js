/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { APCAcontrast } = require('../SAPC-APCA/JS/APCAonly.98e_d12e.js');

test('should provide APCA contrast for first test case', function() {
  let contrastValue = APCAcontrast(0xffffff, 0x888888);

  expect(contrastValue).toBe(66.89346308821438);
});

test('should provide APCA contrast for second test case', function() {
  let contrastValue = APCAcontrast(0x000000, 0xaaaaaa);

  expect(contrastValue).toBe(-60.438571788907524);
});

test('should provide APCA contrast for third test case', function() {
  let contrastValue = APCAcontrast(0x112233, 0xddeeff);

  expect(contrastValue).toBe(-98.44863435731264);
});

test('should provide APCA contrast for fourth test case', function() {
  let contrastValue = APCAcontrast(0x223344, 0x112233);

  expect(contrastValue).toBe(1.276075977788573);
});