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

function createHtmlElement({element, id, src, className, title, styles, type, innerHTML, attributes, eventListeners, appendTo}) {
  const el = document.createElement(element);
  if (id) el.id = id;
  if (className) el.className = className;
  if (src) el.src = src;
  if (styles) {
    for (const [prop, value] of Object.entries(styles)) {
      el.style[prop] = value;
    }
  }
  if (type) el.type = type;
  if (innerHTML) el.innerHTML = innerHTML;
  if (attributes) {
    for (const [prop, value] of Object.entries(attributes)) {
      el.setAttribute(prop, value);
    }
  }
  if (title) el.title = title;
  if (eventListeners) {
    for (const [event, func] of Object.entries(eventListeners)) {
      el.addEventListener(event, func);
    }
  }

  const dest = document.getElementById(appendTo);
  dest.appendChild(el);
}

function createSvgElement({element, id, className, attributes, styles, textContent, appendTo}) {
  const svgns = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(svgns, element);
  if (id) el.id = id;
  if (className) el.className = className;
  if (styles) {
    for (const [prop, value] of Object.entries(styles)) {
      el.style[prop] = value;
    }
  }
  if (attributes) {
    for (const [prop, value] of Object.entries(attributes)) {
      el.setAttributeNS(null, prop, value);
    }
  }
  if (textContent) el.textContent = textContent;
  const dest = document.getElementById(appendTo);
  dest.appendChild(el);
}

module.exports = {
  createHtmlElement,
  createSvgElement
};
