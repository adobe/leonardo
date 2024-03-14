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

import {saveAs} from 'file-saver';
import {_sequentialScale} from './initialSequentialScale';
import {_divergingScale} from './initialDivergingScale';
import {_qualitativeScale} from './initialQualitativeScale';

function createXML(scaleType) {
  let colorClass = scaleType === 'sequential' ? _sequentialScale : scaleType === 'diverging' ? _divergingScale : _qualitativeScale;
  let colors = scaleType === 'qualitative' ? colorClass.keeperColors : colorClass.samples.reverse();
  // Type names for Tableau XML
  let type = scaleType === 'sequential' ? 'ordered-sequential' : scaleType === 'diverging' ? 'ordered-diverging' : 'regular';
  let scaleName = document.getElementById(`${scaleType}_name`).value;

  let colorTags = colors.map((c) => {
    return `<color>${c}</color>`;
  });
  let colorTagString = colorTags.toString().replaceAll(',<', '\n        <');

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
    var blob = new Blob([`${file}`], {type: 'text/plain'});

    saveAs(blob, filename);
  });
}

window.downloadXML = downloadXML;

document.getElementById('sequential_downloadXml').addEventListener('click', () => {
  setTimeout(function () {
    downloadXML('sequential');
  }),
    1000;
});

document.getElementById('diverging_downloadXml').addEventListener('click', () => {
  setTimeout(function () {
    downloadXML('diverging');
  }),
    1000;
});

document.getElementById('qualitative_downloadXml').addEventListener('click', () => {
  setTimeout(function () {
    downloadXML('qualitative');
  }),
    1000;
});

module.exports = {
  createXML,
  downloadXML
};
