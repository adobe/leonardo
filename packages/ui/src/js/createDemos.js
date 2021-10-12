/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {heatmap} from './demos/demo_heatmap';
import {choropleth} from './demos/demo_choropleth';
import {hexbin} from './demos/demo_hexbin';
import {chord} from './demos/demo_chord';
import {violinJitter} from './demos/demo_violinJitter';
import {scatter} from './demos/demo_scatter';

function createDemos(scaleType) {
  const destHeatmap = document.getElementById(`${scaleType}Heatmap`);
  const destChoropleth = document.getElementById(`${scaleType}Choropleth`);
  const destHexbin = document.getElementById(`${scaleType}Hexbin`);
  const destChord = document.getElementById(`${scaleType}Chord`);
  const destViolinJitter = document.getElementById(`${scaleType}ViolinJitter`);
  const destScatter = document.getElementById(`${scaleType}Scatter`);

  const dests = [
    destHeatmap,
    destChoropleth,
    // destHexbin,
    destChord,
    // destViolinJitter,
    destScatter
  ]

  heatmap(scaleType);
  chord(scaleType);
  scatter(scaleType);
  // violinJitter(scaleType);
  // hexbin(scaleType);
  choropleth(scaleType);

  setTimeout(() => {
    for(let i = 0; i < dests.length; i++) {
      while (dests[i].childNodes.length > 1) {
        dests[i].removeChild(dests[i].firstChild);
      }
    }
  }, 300);
}

module.exports = {
  createDemos
}