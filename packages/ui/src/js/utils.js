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


function randomId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

function throttle(func, wait) {
 var timerId, lastRan;

 return function throttled() {
   var context = this;
   var args = arguments;

   if (!lastRan) {
     func.apply(context, args);
     lastRan = Date.now();
   } else {
     clearTimeout(timerId);
     timerId = setTimeout(function () {
       if ((Date.now() - lastRan) >= wait) {
         func.apply(context, args);
         lastRan = Date.now();
       }
     }, (wait - (Date.now() - lastRan)) || 0);
   }
 };
}



function convertToCartesian(s, h) {
  if(s > 100) s = 100;
  // convert degrees to radians
  let hRad = (h * Math.PI) / 180;
  let xAxis = s * Math.cos(hRad);
  let yAxis = s * Math.sin(hRad);

  return{
    x: xAxis,
    y: yAxis
  };
}

function filterNaN(x) {
  if(isNaN(x)) {
    return 0;
  } else {
    return x;
  }
}

function removeElementsByClass(className){
  const elements = document.getElementsByClassName(className);
  while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
  }
}

module.exports = {
  randomId,
  throttle,
  convertToCartesian,
  filterNaN,
  removeElementsByClass
}