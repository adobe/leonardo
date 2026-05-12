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

import {auditPalette} from '@adobe/leonardo-contrast-colors';
import {round} from './utils';

const AA_MIN = 4.5;
const AAA_MIN = 7;

function parseColors(textareaValue) {
  if (typeof textareaValue !== 'string' || textareaValue.trim() === '') {
    return [];
  }
  return textareaValue.split(/\r?\n/);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function sameColorCell(hex) {
  const h = escapeHtml(hex);
  return `
    <div class="paletteAuditor-cell paletteAuditor-cell--same" role="gridcell" aria-label="Same color ${h}, no contrast between foreground and background">
      <span class="paletteAuditor-cellDash" aria-hidden="true">–</span>
    </div>
  `;
}

/** WCAG 2.1 contrast pill for a single level inside a matrix cell */
function contrastPill(level, pass) {
  const state = pass ? 'pass' : 'fail';
  const icon = pass ? '✓' : '✗';
  const word = pass ? 'Pass' : 'Fail';
  const threshold = level === 'AA' ? AA_MIN : AAA_MIN;
  const label = `${level} ${word}, threshold ${threshold} to 1 for normal text`;
  return `
    <span class="paletteAuditor-contrastPill paletteAuditor-contrastPill--${state}" role="img" aria-label="${escapeHtml(label)}">
      <span class="paletteAuditor-contrastPillIcon" aria-hidden="true">${icon}</span>
      <span class="paletteAuditor-contrastPillLevel" aria-hidden="true">${level}</span>
    </span>
  `;
}

function buildCell(cell) {
  const isSame = cell.foreground.toLowerCase() === cell.background.toLowerCase();
  if (isSame) {
    return sameColorCell(cell.foreground);
  }
  const fg = escapeHtml(cell.foreground);
  const bg = escapeHtml(cell.background);
  const ratioText = `${round(cell.ratio, 2)}:1`;

  return `
    <div class="paletteAuditor-cell" role="gridcell" style="background-color: ${bg}; color: ${fg};" aria-label="Foreground ${fg} on background ${bg}, ratio ${ratioText}">
      <span class="paletteAuditor-cellRatio">${ratioText}</span>
      <div class="paletteAuditor-cellPills">
        ${contrastPill('AA', cell.aaPass)}
        ${contrastPill('AAA', cell.aaaPass)}
      </div>
    </div>
  `;
}

function buildColHeader(color) {
  const hex = escapeHtml(color);
  return `
    <div class="paletteAuditor-header paletteAuditor-header--col" role="columnheader">
      <span class="paletteAuditor-swatch" style="background-color: ${hex};" aria-hidden="true"></span>
      <span class="paletteAuditor-headerLabel">${hex}</span>
    </div>
  `;
}

function buildRowHeader(color) {
  const hex = escapeHtml(color);
  return `
    <div class="paletteAuditor-header paletteAuditor-header--row" role="rowheader">
      <span class="paletteAuditor-swatch" style="background-color: ${hex};" aria-hidden="true"></span>
      <span class="paletteAuditor-headerLabel">${hex}</span>
    </div>
  `;
}

/**
 * Count AA/AAA pass and fail for every ordered pair except same-color (diagonal).
 * Each pair contributes one AA result and one AAA result.
 */
function summarize(matrix) {
  let aaPass = 0;
  let aaFail = 0;
  let aaaPass = 0;
  let aaaFail = 0;
  let pairs = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      if (i === j) continue;
      pairs++;
      if (matrix[i][j].aaPass) aaPass++;
      else aaFail++;
      if (matrix[i][j].aaaPass) aaaPass++;
      else aaaFail++;
    }
  }
  return {pairs, aaPass, aaFail, aaaPass, aaaFail};
}

function renderSummaryBar(el, stats) {
  if (!el) return;
  const {pairs, aaPass, aaFail, aaaPass, aaaFail} = stats;
  if (pairs === 0) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }
  el.hidden = false;
  el.innerHTML = `
    <p class="paletteAuditor-summaryIntro spectrum-Body spectrum-Body--sizeS">
      Off-diagonal pairs: <strong>${pairs}</strong> (each pair counts once for AA and once for AAA).
    </p>
    <div class="paletteAuditor-summaryPills" role="group" aria-label="WCAG 2.1 normal text summary">
      <span class="paletteAuditor-summaryPill paletteAuditor-summaryPill--pass" title="AA normal text ≥ ${AA_MIN}:1">
        <span class="paletteAuditor-summaryPillValue">${aaPass}</span>
        <span class="paletteAuditor-summaryPillLabel">AA pass</span>
      </span>
      <span class="paletteAuditor-summaryPill paletteAuditor-summaryPill--fail" title="Below AA for normal text">
        <span class="paletteAuditor-summaryPillValue">${aaFail}</span>
        <span class="paletteAuditor-summaryPillLabel">AA fail</span>
      </span>
      <span class="paletteAuditor-summaryPill paletteAuditor-summaryPill--pass" title="AAA normal text ≥ ${AAA_MIN}:1">
        <span class="paletteAuditor-summaryPillValue">${aaaPass}</span>
        <span class="paletteAuditor-summaryPillLabel">AAA pass</span>
      </span>
      <span class="paletteAuditor-summaryPill paletteAuditor-summaryPill--fail" title="Below AAA for normal text">
        <span class="paletteAuditor-summaryPillValue">${aaaFail}</span>
        <span class="paletteAuditor-summaryPillLabel">AAA fail</span>
      </span>
    </div>
  `;
}

function renderAudit() {
  const textarea = document.getElementById('paletteAuditorColors');
  const matrixWrapper = document.getElementById('paletteAuditorMatrix');
  const emptyState = document.getElementById('paletteAuditorEmpty');
  const summaryEl = document.getElementById('paletteAuditorSummary');
  if (!textarea || !matrixWrapper) return;

  matrixWrapper.innerHTML = '';
  matrixWrapper.removeAttribute('style');

  const matrix = auditPalette(parseColors(textarea.value));

  if (matrix.length < 2) {
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.removeAttribute('hidden');
    }
    if (matrixWrapper) {
      matrixWrapper.innerHTML = '';
      matrixWrapper.removeAttribute('style');
      matrixWrapper.setAttribute('aria-hidden', 'true');
    }
    renderSummaryBar(summaryEl, {pairs: 0, aaPass: 0, aaFail: 0, aaaPass: 0, aaaFail: 0});
    return;
  }

  if (emptyState) {
    emptyState.style.display = 'none';
    emptyState.setAttribute('hidden', 'true');
  }
  if (matrixWrapper) matrixWrapper.removeAttribute('aria-hidden');

  const colors = matrix.map((row) => row[0].foreground);
  const size = colors.length;

  let html = '<div class="paletteAuditor-cornerCell" aria-hidden="true"></div>';
  for (const color of colors) {
    html += buildColHeader(color);
  }
  for (let i = 0; i < size; i++) {
    html += buildRowHeader(colors[i]);
    for (let j = 0; j < size; j++) {
      html += buildCell(matrix[i][j]);
    }
  }

  matrixWrapper.style.gridTemplateColumns = `140px repeat(${size}, minmax(120px, 1fr))`;
  matrixWrapper.style.gridTemplateRows = `auto repeat(${size}, minmax(112px, 1fr))`;
  matrixWrapper.innerHTML = html;

  renderSummaryBar(summaryEl, summarize(matrix));
}

const textarea = document.getElementById('paletteAuditorColors');
if (textarea) {
  const rerender = () => renderAudit();
  textarea.addEventListener('input', rerender);
  textarea.addEventListener('change', rerender);
  textarea.addEventListener('cut', () => requestAnimationFrame(rerender));
  textarea.addEventListener('paste', () => requestAnimationFrame(rerender));
  renderAudit();
}

export {renderAudit as paletteAuditorRender};
