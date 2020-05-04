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

const { binarySearch } = require('../index.cjs');

test('should return index of exact match (ascending)', function() {
  let list = [1, 2, 3, 3.07, 3.1, 3.12, 3.13, 3.14, 3.3, 5, 12];
  let value = 3.12;
  let baseLum = 0.7;
  let searchIndex = binarySearch(list, value, baseLum); // returns index

  expect(searchIndex).toBe(5); // list[5] // 3.12 indexed at 5
});

test('should return index of exact match (descending)', function() {
  let list = [12, 5, 3.3, 3.14, 3.13, 3.12, 3.1, 3.07, 3, 2, 1];
  let value = 3.12;
  let baseLum = 0.3;
  let searchIndex = binarySearch(list, value, baseLum); // returns index

  expect(searchIndex).toBe(5); // list[5] // 3.12 indexed at 5
});

test('should return index of closest match (ascending)', function() {
  let list = [1, 2, 3, 3.07, 3.1, 3.12, 3.13, 3.14, 3.3, 5, 12];
  let value = 3.09;
  let baseLum = 0.7;
  let searchIndex = binarySearch(list, value, baseLum); // returns index

  expect(searchIndex).toBe(4); // list[4] // 3.1 indexed at 4
});

test('should return exact match (ascending)', function() {
  let list = [1, 2, 3, 3.07, 3.1, 3.12, 3.13, 3.14, 3.3, 5, 12];
  let value = 3.12;
  let baseLum = 0.7;
  let searchIndex = binarySearch(list, value, baseLum); // returns index
  let searchResult = list[searchIndex];

  expect(searchResult).toBe(3.12);
});

test('should return exact match (descending)', function() {
  let list = [12, 5, 3.3, 3.14, 3.13, 3.12, 3.1, 3.07, 3, 2, 1];
  let value = 3.12;
  let baseLum = 0.3;
  let searchIndex = binarySearch(list, value, baseLum); // returns index
  let searchResult = list[searchIndex];

  expect(searchResult).toBe(3.12);
});

test('should return closest match (ascending)', function() {
  let list = [1, 2, 3, 3.07, 3.1, 3.12, 3.13, 3.14, 3.3, 5, 12];
  let value = 3.09;
  let baseLum = 0.7;
  let searchIndex = binarySearch(list, value, baseLum); // returns index
  let searchResult = list[searchIndex];

  expect(searchResult).toBe(3.1);
});
