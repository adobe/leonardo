import {heatmap} from './demos/demo_heatmap';

function createDemos(scaleType) {
  const destHeatmap = document.getElementById(`${scaleType}Heatmap`);

  heatmap(scaleType);

  setTimeout(() => {
    while (destHeatmap.childNodes.length > 1) {
      destHeatmap.removeChild(destHeatmap.firstChild);
    }
  }, 100);
}

module.exports = {
  createDemos
}