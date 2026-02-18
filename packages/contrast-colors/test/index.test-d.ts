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

import {expectType} from 'tsd';
import {createScale, convertColorValue} from '..';
import type {CssColor} from '..';
import ChromaJs from 'chroma-js';

// convertColorValue: object=true → Record<string, number>
expectType<Record<string, number>>(convertColorValue('#ff0000', 'RGB', true));

// convertColorValue: object=false or omitted → string
expectType<string>(convertColorValue('#ff0000', 'RGB', false));
expectType<string>(convertColorValue('#ff0000', 'RGB'));

// createScale: default (asFun omitted or false) → CssColor[]
expectType<CssColor[]>(createScale({swatches: 8, colorKeys: ['#ff0000'], colorSpace: 'LAB'}));
expectType<CssColor[]>(createScale({swatches: 8, colorKeys: ['#ff0000'], colorSpace: 'LAB', asFun: false}));

// createScale: asFun=true → ChromaJs['Scale'] (scale function)
expectType<(typeof ChromaJs)['Scale']>(createScale({swatches: 8, colorKeys: ['#ff0000'], colorSpace: 'LAB', asFun: true}));
