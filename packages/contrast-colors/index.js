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

import chroma from 'chroma-js';
import {extendChroma} from './lib/chroma-plus.js';
import {convertColorValue, createScale, getContrast as contrast, luminance, minPositive, ratioName} from './lib/utils.js';

import {Color} from './lib/color.js';
import {BackgroundColor} from './lib/backgroundcolor.js';
import {Theme} from './lib/theme.js';

extendChroma(chroma);

// console.color('#6fa7ff');
// console.ramp(chroma.scale(['yellow', 'navy']).mode('hsl'))

export {Color, BackgroundColor, Theme, createScale, luminance, contrast, minPositive, ratioName, convertColorValue};
