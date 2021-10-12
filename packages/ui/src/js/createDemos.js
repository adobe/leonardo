import {heatmap} from './demos/demo_heatmap';
import {choropleth} from './demos/demo_choropleth';

function createDemos(scaleType) {
  const destHeatmap = document.getElementById(`${scaleType}Heatmap`);
  const destChoropleth = document.getElementById(`${scaleType}Choropleth`);

  const dests = [
    destHeatmap,
    destChoropleth
  ]

  heatmap(scaleType);
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