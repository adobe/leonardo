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

import * as Leo from '@adobe/leonardo-contrast-colors';

const tempGray = new Leo.BackgroundColor({
  name: 'Gray',
  colorKeys: ['#cacaca'],
  colorspace: 'RGB',
  ratios: [3, 4.5]
});

let _theme = new Leo.Theme({
  colors: [ tempGray ],
  backgroundColor: tempGray,
  lightness: 98,
  contrast: 1
});

module.exports = {
  tempGray,
  _theme
}