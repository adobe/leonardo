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
import d3 from './d3';
import Plotly from 'plotly.js-dist-min';
import {getThemeName} from './getThemeData';
import {filterNaN, convertToCartesian, getChannelsAndFunction} from './utils';

function create3dModel(dest, colorClasses, mode, scaleType = 'theme') {
  // Force colorClasses to be an array if it was erroneously passed
  // as a single color class.
  if (!Array.isArray(colorClasses)) colorClasses = [colorClasses];

  // Hide all example images
  if (scaleType === 'theme') {
    let images = document.getElementsByClassName('ModelImage');
    for (let i = 0; i < images.length; i++) {
      if (!images[i].classList.contains('is-hidden')) images[i].classList.add('is-hidden');
    }
  }

  var pointCount = 3142;
  var i, r;

  var x = [];
  var y = [];
  var z = [];
  var c = [];

  for (i = 0; i < pointCount; i++) {
    r = i * (pointCount - i);
    x.push(r * Math.cos(i / 30));
    y.push(r * Math.sin(i / 30));
    z.push(i);
    c.push(i);
  }

  const data = createColorData(colorClasses, mode, scaleType);

  const colorWay = colorClasses.map((c) => {
    return c.colorKeys[0];
  });
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const downloadFileName = scaleType === 'theme' ? `${getThemeName()}_3dModel` : `${scaleType}Scale_3dModel`;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const height = dest === 'paletteModelWrapper' ? windowHeight - 120 : windowHeight - 260;
  let width = windowWidth - (424 + 304 + 32); // Fit to window, minus panel and padding
  if (dest === 'sequentialModelWrapper' || dest === 'tabModelContent' || dest === 'divergingModelWrapper') {
    if (width > 796) width = 796; // Max width for scale views of 3d model
  }

  const canvasColor = mq.matches ? '#1d1d1d' : '#f5f5f5';

  const layout = {
    colorway: colorWay,
    autosize: true,
    height: height,
    width: width,
    showLegend: false,
    showscale: false,
    margin: {
      l: 24,
      r: 24,
      b: 24,
      t: 24,
      pad: 0
    },
    paper_bgcolor: canvasColor,
    scene: {
      camera: {
        eye: {
          x: 1,
          y: -1,
          z: 0.5 // 0.25
        },
        projection: {
          type: 'orthographic' // 'perspective' or 'orthographic'
        }
      },
      // aspectmode: 'data', // data matches the dataset, cube forces into a cube shape
      aspectratio: {x: 1, y: 1, z: 1},
      xaxis: {
        nticks: 5,
        title: '',
        showspikes: false,
        showgrid: false
      },
      yaxis: {
        nticks: 5,
        title: '',
        showspikes: false,
        showgrid: false
      },
      zaxis: {
        nticks: 5,
        title: 'Luminosity',
        showspikes: false,
        showgrid: false
      }
    }
  };

  const config = {
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: downloadFileName,
      height: 700,
      width: 700,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },
    displayModeBar: true,
    modeBarButtonsToRemove: ['orbitRotation'],
    displaylogo: false,
    responsive: true
  };

  // Create 3d plot
  Plotly.newPlot(dest, data, layout, config);

  // Then, display example image based on the selected mode.
  if (scaleType === 'theme') {
    let modelMode = mode === 'CAM02' ? 'LAB' : mode === 'CAM02p' ? 'LCH' : mode === 'HSLuv' ? 'LUV' : mode === 'OKLCH' ? 'OKLAB' : mode;
    let image = document.getElementById(`ModelImage_${modelMode}`);
    image.classList.remove('is-hidden');
  }
}

function createColorData(colorClasses, mode, scaleType) {
  const f = getChannelsAndFunction(mode);
  const method = (d) => chroma(d)[f.func]();

  let dataArray = [];

  for (let i = 0; i < colorClasses.length; i++) {
    let currentColor = !scaleType || scaleType === 'theme' ? colorClasses[i].backgroundColorScale : colorClasses[i].colors;

    let dataA = currentColor.map(function (d) {
      let channelValue = method(d)[f.c1];
      // Need to do some geometry for polar colorspaces
      if (mode === 'CAM02p' || mode === 'LCH' || mode === 'HSL' || mode === 'HSV' || mode === 'HSLuv' || mode === 'OKLCH') {
        let s = mode === 'HSL' || mode === 'HSV' ? method(d)[f.c2] * 100 : mode === 'OKLCH' ? method(d)[f.c2] * 310 : method(d)[f.c2];
        let h = channelValue;
        return filterNaN(convertToCartesian(s, h).x);
      }
      if (mode === 'OKLAB') return filterNaN(channelValue * 460);
      else return filterNaN(channelValue);
    });
    let dataB = currentColor.map(function (d) {
      let channelValue = method(d)[f.c3];
      if (mode === 'HSL' || mode === 'HSV' || mode === 'OKLCH' || mode === 'OKLAB') channelValue = channelValue * 100;
      return filterNaN(channelValue);
    });
    let dataC = currentColor.map(function (d) {
      let channelValue = method(d)[f.c2];
      // Need to do some geometry for polar colorspaces
      if (mode === 'CAM02p' || mode === 'LCH' || mode === 'HSL' || mode === 'HSV' || mode === 'HSLuv' || mode === 'OKLCH') {
        let s = mode === 'HSL' || mode === 'HSV' ? channelValue * 100 : mode === 'OKLCH' ? channelValue * 310 : channelValue;
        let h = method(d)[f.c1];
        return filterNaN(convertToCartesian(s, h).y);
      }
      if (mode === 'OKLAB') return filterNaN(channelValue * 460);
      return filterNaN(channelValue);
    });

    let dataObj = {
      type: 'scatter3d',
      mode: 'lines',
      x: dataA,
      y: dataC,
      z: dataB,
      name: colorClasses[i].name,
      opacity: 1,
      markercolor: 'red',
      line: {
        width: 16,
        color: currentColor
      }
    };

    dataArray.push(dataObj);
  }

  /**
   * Generate hidden scatterplot points at the min/max
   * positions of the color space's gamut. Then merge that
   * data with the color data. This ensures the 3d models
   * are proportional and do not change scale based on the
   * color scale data alone. This makes it much easier to
   * evaluate shape and identify changes or irregularities
   * to the interpolations in 3d space.
   */
  let minMaxPoints = createMinMaxDataForPlot(mode);
  let mergedData = [...dataArray, ...minMaxPoints];

  return mergedData;
}

function createMinMaxDataForPlot(mode) {
  let dataArray = [];
  const markerSize = 1;
  const markerColor = 'rgba(0, 0, 0, 0)';
  let dataA, dataB, dataC;

  if (mode === 'CAM02p' || mode === 'LCH' || mode === 'HSL' || mode === 'HSV' || mode === 'HSLuv' || mode === 'OKLCH') {
    dataA = [0, 100];
    dataB = [0, 100];
    dataC = [0, -100];
  }
  if (mode === 'LAB') {
    dataA = [0, 100];
    dataB = [-128, 128];
    dataC = [-128, 128];
  }
  if (mode === 'OKLAB') {
    dataA = [0, 100];
    dataB = [-128, 128];
    dataC = [-128, 128];
  }
  if (mode === 'CAM02') {
    dataA = [0, 100];
    dataB = [-50, 50];
    dataC = [-50, 50];
  }
  if (mode === 'RGB') {
    dataA = [0, 255];
    dataB = [0, 255];
    dataC = [0, 255];
  }

  let dataObj1 = {
    type: 'scatter3d',
    mode: 'markers',
    x: [0, 0],
    y: [0, 0],
    z: dataA,
    name: ' ',
    opacity: 1,
    markercolor: markerColor,
    marker: {
      size: markerSize,
      color: markerColor
    }
  };

  let dataObj2 = {
    type: 'scatter3d',
    mode: 'markers',
    x: [0, 0],
    y: dataB,
    z: [0, 0],
    name: ' ',
    opacity: 1,
    markercolor: markerColor,
    marker: {size: markerSize, color: markerColor}
  };

  let dataObj3 = {
    type: 'scatter3d',
    mode: 'markers',
    x: dataB,
    y: dataC,
    z: [0, 0],
    name: ' ',
    opacity: 1,
    markercolor: markerColor,
    marker: {size: markerSize, color: markerColor}
  };

  let dataObj4 = {
    type: 'scatter3d',
    mode: 'markers',
    x: dataC,
    y: [0, 0],
    z: [0, 0],
    name: ' ',
    opacity: 1,
    markercolor: markerColor,
    marker: {size: markerSize, color: markerColor}
  };

  dataArray.push(dataObj1);
  dataArray.push(dataObj2);
  dataArray.push(dataObj3);
  dataArray.push(dataObj4);

  return dataArray;
}

module.exports = {
  create3dModel
};
