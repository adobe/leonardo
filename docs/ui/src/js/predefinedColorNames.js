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
import {getAllColorNames} from './getThemeData';
import {getColorDifference, capitalizeFirstLetter} from './utils';
const colorNames = require('./colornames');

const predefinedColorNames = [
  'Azure',
  'Forest',
  'Cerulean',
  'Blue',
  'Pink',
  'Red',
  'Indigo',
  'Purple',
  'Blue',
  'Green',
  'Crimson',
  'Salmon',
  'Orange',
  'Tangerine',
  'Yellow',
  'Brown',
  'Umber',
  'Ochre',
  'Periwinkle',
  'Sage',
  'Rose',
  'Lavender',
  'Lilac',
  'Mauve',
  'Mustard',
  'Seafoam',
  'Celery',
  'Teal',
  'Turquise',
  'Sky',
  'Gray',
  'Slate'
];

function getClosestColorName(color) {
  let diffs = [];
  let keys = [];
  for (const [key, value] of Object.entries(colorNames)) {
    let colorDifference = getColorDifference(color, value);
    if (colorDifference < 10) {
      diffs.push(colorDifference);
      keys.push(key);
    }
  }
  if (diffs.length > 0) {
    const minDiff = Math.min(...diffs);
    const index = diffs.indexOf(minDiff);
    const closestMatchingKey = keys[index];
    return capitalizeFirstLetter(closestMatchingKey);
  }
}

function getRandomColorName() {
  const existingColorNames = getAllColorNames();
  const predefinedColorNames = Object.keys(colorNames);
  let colorNameOptions = predefinedColorNames.filter((item) => !existingColorNames.includes(item));
  return capitalizeFirstLetter(colorNameOptions[Math.floor(Math.random() * colorNameOptions.length)]);
}

module.exports = {
  predefinedColorNames,
  getClosestColorName,
  getRandomColorName
};
