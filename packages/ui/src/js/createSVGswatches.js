import { saveAs } from 'file-saver';
import d3 from './d3';
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {_qualitativeScale} from './initialQualitativeScale';

import { createSvgElement } from './createHtmlElement';

function createSVGswatches(scaleType) {
  let colorClass = (scaleType === 'sequential') ? _sequentialScale : (
    (scaleType === 'diverging') ? _divergingScale : _qualitativeScale
    );
  let colors = (scaleType === 'qualitative') ? colorClass.keeperColors : colorClass.samples.reverse();
  var svgns = "http://www.w3.org/2000/svg";

  const rectSize = 80;
  const marginX = 8;

  const swatchesPerColor = colors.length;
  const maxColorWidth = ((rectSize + marginX) * swatchesPerColor);
  const maxSvgWidth = maxColorWidth;
  const maxSvgHeight = rectSize;
  
  let svgWrapper = document.createElementNS(svgns, 'svg');
  svgWrapper.setAttribute("xmlns", svgns);
  svgWrapper.setAttribute("version", "1.1");
  svgWrapper.setAttributeNS( null, 'width', maxSvgWidth + 'px' );
  svgWrapper.setAttributeNS( null, 'height', maxSvgHeight + 'px' );
  svgWrapper.setAttribute("aria-hidden", "true");
  svgWrapper.id = 'svg'

  let outerElement = document.createElement('div');
  outerElement.id = `${scaleType}SVGcolorSamples`;
  let y = 0;

  outerElement.appendChild(svgWrapper);
  document.body.appendChild(outerElement);

  for(let i = 0; i < colors.length; i++) {
    let x = (rectSize + marginX) * i;

    let rect = document.createElementNS(svgns, 'rect');
    rect.setAttributeNS( null,'x',x );
    rect.setAttributeNS( null,'y',y );
    rect.setAttributeNS( null,'width', rectSize );
    rect.setAttributeNS( null,'height', rectSize );
    rect.setAttributeNS( null,'rx', 8 );
    rect.setAttributeNS( null,'fill', colors[i] );
    svgWrapper.appendChild(rect)
  }
}

function downloadSwatches(scaleType) {
  const createSvg = Promise.resolve(createSVGswatches(scaleType));

  createSvg.then(() => {
    let svg = document.getElementById(`${scaleType}SVGcolorSamples`).innerHTML;

    let filename = `${scaleType}_colors.svg`;
    var blob = new Blob([`${svg}`], {type: "image/svg+xml;charset=utf-8"});
  
    saveAs(blob, filename);
    console.log(document.getElementById(`${scaleType}SampleSwatches`))
    document.getElementById(`${scaleType}SVGcolorSamples`).remove();
  })
}

window.downloadSwatches = downloadSwatches;

document.getElementById('downloadSequentialSwatches').addEventListener('click', () => {
  setTimeout(function() {
    downloadSwatches('sequential')
  }),
  1000
})

document.getElementById('downloadDivergingSwatches').addEventListener('click', () => {
  setTimeout(function() {
    downloadSwatches('diverging')
  }),
  1000
})

document.getElementById('downloadQualitativeSwatches').addEventListener('click', () => {
  setTimeout(function() {
    downloadSwatches('qualitative')
  }),
  1000
})

module.exports = {
  createSVGswatches,
  downloadSwatches
}