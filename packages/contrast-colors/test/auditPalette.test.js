/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import test from 'ava';
import {auditPalette} from '../index.js';

test('builds a black/white WCAG 2.1 contrast matrix', (t) => {
  const matrix = auditPalette(['#000000', '#ffffff', '  ', 'not-a-color']);

  t.is(matrix.length, 2);
  t.is(matrix[0].length, 2);

  const whiteOnBlack = matrix[1][0];
  t.is(whiteOnBlack.foreground, '#ffffff');
  t.is(whiteOnBlack.background, '#000000');
  t.is(whiteOnBlack.ratio, 21);
  t.true(whiteOnBlack.aaPass);
  t.true(whiteOnBlack.aaaPass);

  const blackOnWhite = matrix[0][1];
  t.is(blackOnWhite.ratio, 21);
  t.true(blackOnWhite.aaaPass);

  const blackOnBlack = matrix[0][0];
  t.is(blackOnBlack.ratio, 1);
  t.false(blackOnBlack.aaPass);
  t.false(blackOnBlack.aaaPass);
});
