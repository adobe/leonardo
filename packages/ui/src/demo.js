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

import * as contrastColors from '@adobe/leonardo-contrast-colors';
import './demo.css';


function setup() {
  let br = document.getElementById('sliderBrightness');
  br.min= "-15";
  br.max= "0";
  br.defaultValue = '-3';

  let calendar = document.getElementById('calendar')
  calendar.innerHTML = ' ';

  let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  let d = new Date();
  let month = monthNames[d.getMonth()];

  let colNum = 5;
  for (let i = 0; i<colNum; i++) {
    let col = document.createElement('div');
    col.className = 'calendarColumn';
    col.id = 'calendarColumn'+i;

    let head = document.createElement('div');
    head.className = 'calendarColumnHeader';

    let today = new Date();
    let date = month+' '+ (today.getDate()+i);

    head.innerHTML = date;

    col.appendChild(head);

    let hours = 18;
    for (let i=0; i<hours; i++) {
      let half = document.createElement('div');
      let full = document.createElement('div');
      half.className = 'calendar30';
      full.className = 'calendar60';

      col.appendChild(half);
      col.appendChild(full);
    }

    calendar.appendChild(col);
  }
}
setup();

function createEvent(col, dur, title, meta, cat, pos, width, customClass) {
  if(!width){
    width = 'eventSingle';
  }
  // pos is position related to half-hour increments. Ie, how many rows down.
  let en = document.createElement('div');
  let head = document.createElement('span');
  let t = document.createTextNode(title);
  head.className = 'eventTitle';
  head.appendChild(t);

  let detail = document.createElement('span');
  let d = document.createTextNode(meta);
  detail.className = 'eventMeta';
  detail.appendChild(d);

  en.classList.add('event', dur, cat, width, customClass);
  en.appendChild(head);
  en.appendChild(detail);
  en.style.top = 56 + (pos * 33);

  col.appendChild(en);
}

let col0 = document.getElementById('calendarColumn0');
let col1 = document.getElementById('calendarColumn1');
let col2 = document.getElementById('calendarColumn2');
let col3 = document.getElementById('calendarColumn3');
let col4 = document.getElementById('calendarColumn4');

// Populate calendar with events
// Col 0
createEvent(col0, 'event30', 'Gym', '-', 'catPersonal', 1, 'eventDouble');
createEvent(col0, 'event90', 'Office Hour', 'UT-331', 'catPrimary', 1, 'eventDouble');
createEvent(col0, 'event60', 'Research Planning', 'UT-105', 'catDefault', 6);
createEvent(col0, 'event90', 'Office Hour', 'UT-201', 'catPrimary', 10);
createEvent(col0, 'event60', 'Project Sync', 'UT-220', 'catBlue', 16);
// Col 1
createEvent(col1, 'event30', 'Gym', '-', 'catPersonal', 1);
createEvent(col1, 'event120', 'Employee Meeting', 'UT-203', 'catImportant', 4);
createEvent(col1, 'event90', 'Leonardo integration', 'https://leonardocolor.io', 'catBlue', 12, 'eventSingle', 'is-selected');

// Col 2
createEvent(col2, 'event30', 'Gym', '-', 'catPersonal', 1);
createEvent(col2, 'event60', 'Workshop', 'UT-440', 'catBlue', 4);
createEvent(col2, 'event90', 'Office Hour', 'UT-201', 'catPrimary', 10, 'eventDouble');
createEvent(col2, 'event30', 'Color sync', 'UT-220', 'catDefault', 10, 'eventDouble');
createEvent(col2, 'event30', 'Submission Deadline', '-', 'catUrgent', 18);

// Col 3
createEvent(col3, 'event30', 'Gym', '-', 'catPersonal', 1);
createEvent(col3, 'event60', 'User Interview', 'UT-203', 'catDefault', 4);
createEvent(col3, 'event60', 'User Interview', 'UT-203', 'catDefault', 7);
createEvent(col3, 'event60', 'User Interview', 'UT-203', 'catDefault', 12);
createEvent(col3, 'event120', 'Sprint Demo', 'UT-440', 'catImportant', 16, 'eventDouble');
createEvent(col3, 'event60', 'Color palette review', 'UT-330', 'catBlue', 19, 'eventDouble');

// Col 4
createEvent(col4, 'event30', 'Gym', '-', 'catPersonal', 1);
createEvent(col4, 'event60', 'Workshop', 'UT-440', 'catBlue', 4);
createEvent(col4, 'event120', 'Backlog grooming', 'UT-112', 'catPrimary', 8);

function createColors() {
  var br = document.getElementById('sliderBrightness');
  var con = document.getElementById('sliderContrast');
  var mode = document.getElementById('darkMode');


  var brVal = br.value * -1; // convert br.value to positive number to use as index
  var conVal = con.value;

  // TEST -> Define colors as configs and scales.


  // generateContrastColors({base: "#f4f5f8"});
  var baseRatios = [-1.1,1,1.12,1.25,1.45,1.75,2.25,3.01,4.52,7,11,16];
  var uiRatios = [1,1.12,1.3,2,3.01,4.52,7,11,16];

  var grayScale = contrastColors.createScale({
    swatches: 100,
    colorKeys: ["#4a5b7b","#72829c","#a6b2c6"],
    colorspace: 'HSL'
  });
  var base = grayScale.colors[5];
  // console.log(grayScale.colors);

  var baseScale = {
    colorKeys: grayScale.colorKeys,
    colorspace: grayScale.colorspace
  }

  var purpleScale = {
    colorKeys: ["#7a4beb","#ac80f4","#2f0071"],
    colorspace: "LAB"
  }

  var blueScale = {
    colorKeys: ['#0272d4','#b2f0ff','#55cfff','#0037d7'],
    colorspace: "CAM02"
  };

  var greenScale = {
    colorKeys: ["#4eb076","#2a5a45","#a7e3b4"],
    colorspace: "HSL"
  }
  var redScale = {
    colorKeys: ["#ea2825","#ffc1ad","#fd937e"],
    colorspace: "LAB"
  };

  var goldScale = {
    colorKeys: ["#e8b221","#a06a00","#ffdd7c"],
    colorspace: "HSL"
  }

  br.min= "-15";
  br.max= "0";

  if(mode.checked == true) {
    brVal = 80 + brVal;
    var base = grayScale.colors[brVal];

    document.documentElement.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
  } else {
    var base = grayScale.colors[brVal];
    document.documentElement.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
  }

  baseRatios = baseRatios.map(function(d) {
    var newVal = ((d-1) * conVal) + 1;
    return newVal;
  });
  uiRatios = uiRatios.map(function(d) {
    var newVal = ((d-1) * conVal) + 1;
    return newVal;
  });

  // adaptColor();
  let grayArray = contrastColors.generateContrastColors({colorKeys: baseScale.colorKeys, colorspace: baseScale.colorspace, base: base, ratios: baseRatios});
  let redArray = contrastColors.generateContrastColors({colorKeys: redScale.colorKeys, colorspace: redScale.colorspace, base: base, ratios: uiRatios});
  let blueArray = contrastColors.generateContrastColors({colorKeys: blueScale.colorKeys, colorspace: blueScale.colorspace, base: base, ratios: uiRatios});
  let purpleArray = contrastColors.generateContrastColors({colorKeys: purpleScale.colorKeys, colorspace: purpleScale.colorspace, base: base, ratios: uiRatios});
  let greenArray = contrastColors.generateContrastColors({colorKeys: greenScale.colorKeys, colorspace: greenScale.colorspace, base: base, ratios: uiRatios});
  let goldArray = contrastColors.generateContrastColors({colorKeys: goldScale.colorKeys, colorspace: goldScale.colorspace, base: base, ratios: uiRatios});

  // Grays
  document.documentElement.style
    .setProperty('--gray50', grayArray[0]);
  for (let i=1; i<grayArray.length; i++) { // start after first value
    let prop = '--gray' + (i * 100).toString();
    document.documentElement.style
      .setProperty(prop, grayArray[i]);
    console.log(prop);
  }
  // Blues
  for (let i=0; i<blueArray.length; i++) {
    let prop = '--blue' + ((i+1) * 100).toString();
    document.documentElement.style
      .setProperty(prop, blueArray[i]);
  }
  // Purples
  for (let i=0; i<purpleArray.length; i++) {
    let prop = '--purple' + ((i+1) * 100).toString();
    document.documentElement.style
      .setProperty(prop, purpleArray[i]);
  }
  // Greens
  for (let i=0; i<greenArray.length; i++) {
    let prop = '--green' + ((i+1) * 100).toString();
    document.documentElement.style
      .setProperty(prop, greenArray[i]);
  }
  // Gold
  for (let i=0; i<goldArray.length; i++) {
    let prop = '--gold' + ((i+1) * 100).toString();
    document.documentElement.style
      .setProperty(prop, goldArray[i]);
  }
  // Red
  for (let i=0; i<redArray.length; i++) {
    let prop = '--red' + ((i+1) * 100).toString();
    document.documentElement.style
      .setProperty(prop, redArray[i]);
  }
}
createColors();


window.createColors = createColors;
