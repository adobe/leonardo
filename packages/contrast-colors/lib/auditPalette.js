/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import chroma from 'chroma-js';

import {getContrast} from './utils.js';

/**
 * @typedef {Object} AuditCell
 * @property {string} foreground Hex string of the foreground (text) color for this cell.
 * @property {string} background Hex string of the background color for this cell.
 * @property {number} ratio Unsigned WCAG 2.1 contrast ratio (always `>= 1`).
 * @property {boolean} aaPass `true` when `ratio >= 4.5` (WCAG 2.1 AA, normal text).
 * @property {boolean} aaaPass `true` when `ratio >= 7` (WCAG 2.1 AAA, normal text).
 */

/**
 * Audit every color in a palette against every other color and return a
 * contrast matrix using WCAG 2.1.
 *
 * Each cell pairs a foreground (row) and background (column); the diagonal
 * compares a color with itself. Ratios are derived from the library's
 * existing {@link getContrast} (`wcag2`) — this function does not reimplement
 * any contrast math, it only normalizes the signed return value to the
 * standard `:1` ratio via `Math.abs`.
 *
 * Invalid hex strings and empty lines are skipped silently so a single bad
 * entry does not invalidate the rest of the palette.
 *
 * @param {string[]} colors Hex strings (e.g. `'#1473e6'`). Whitespace is trimmed.
 * @returns {AuditCell[][]} A square matrix where `matrix[i][j]` describes
 *   foreground `colors[i]` rendered on background `colors[j]`.
 *
 * @example
 * import { auditPalette } from '@adobe/leonardo-contrast-colors';
 *
 * const matrix = auditPalette(['#000000', '#ffffff']);
 * matrix[1][0].ratio;   // 21 — white text on black background
 * matrix[1][0].aaaPass; // true
 */
function auditPalette(colors) {
  if (!Array.isArray(colors)) {
    throw new Error('auditPalette expects an array of hex color strings');
  }

  const normalized = colors
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0 && chroma.valid(value))
    .map((value) => {
      const color = chroma(value);
      return {hex: color.hex(), rgb: color.rgb()};
    });

  return normalized.map((fg) =>
    normalized.map((bg) => {
      const ratio = Math.abs(getContrast(fg.rgb, bg.rgb));
      return {
        foreground: fg.hex,
        background: bg.hex,
        ratio,
        aaPass: ratio >= 4.5,
        aaaPass: ratio >= 7
      };
    })
  );
}

export {auditPalette};
