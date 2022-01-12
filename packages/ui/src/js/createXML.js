import { saveAs } from 'file-saver';
import d3 from './d3';
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {_qualitativeScale} from './initialQualitativeScale';

import { createXmlFileElement } from './createHtmlElement';

function createXML(scaleType) {
  let colorClass = (scaleType === 'sequential') ? _sequentialScale : (
    (scaleType === 'diverging') ? _divergingScale : _qualitativeScale
    );
  let colors = (scaleType === 'qualitative') ? colorClass.keeperColors : colorClass.samples.reverse();
  // Type names for Tableau XML
  let type = (scaleType === 'sequential') ? "ordered-sequential" : ((scaleType === 'diverging') ? "ordered-diverging" : "regular");
  let scaleName = document.getElementById(`${scaleType}_name`).value;

  let colorTags = colors.map((c) => {return `<color>${c}</color>`});
  let colorTagString = colorTags.toString().replaceAll(',', '\n        ');

  let xml = `
  <?xml version='1.0'?>
  <workbook>
    <preferences>
      <color-palette name="${scaleName}" type="${type}">
        ${colorTagString}
      </color-palette>
    </preferences>
  </workbook>`;
  
  return xml;
}

function downloadXML(scaleType) {
  const createXmlFile = Promise.resolve(createXML(scaleType));

  createXmlFile.then((file) => {
    let scaleName = document.getElementById(`${scaleType}_name`).value;

    let filename = `${scaleName}_${scaleType}_colors.xml`;
    var blob = new Blob([`${file}`], {type: "text/plain"});
  
    saveAs(blob, filename);
  })
}

window.downloadXML = downloadXML;

document.getElementById('sequential_downloadXml').addEventListener('click', () => {
  setTimeout(function() {
    downloadXML('sequential')
  }),
  1000
})

document.getElementById('diverging_downloadXml').addEventListener('click', () => {
  setTimeout(function() {
    downloadXML('diverging')
  }),
  1000
})

document.getElementById('qualitative_downloadXml').addEventListener('click', () => {
  setTimeout(function() {
    downloadXML('qualitative')
  }),
  1000
})

module.exports = {
  createXML,
  downloadXML
}