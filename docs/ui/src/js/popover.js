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

function togglePopover(e) {
  let thisId = e.target.id;
  let baseId;

  if (thisId.includes('button')) {
    baseId = thisId.replace('button', '');
  }
  if (thisId.includes('close')) {
    baseId = thisId.replace('close', '');
  }

  let targetId = `popover`.concat(baseId);
  let buttonId = `button`.concat(baseId);

  let button = document.getElementById(buttonId);
  let popover = document.getElementById(targetId);

  if (popover.classList.contains('is-open')) {
    popover.classList.remove('is-open');
    button.classList.remove('is-selected');
  } else {
    popover.classList.add('is-open');
    button.classList.add('is-selected');
  }

  // Remove open/selection states from all other buttons and popovers
  let popovers = document.getElementsByClassName('spectrum-Popover');
  let buttons = document.getElementsByClassName('spectrum-Popover-trigger');
  for (i = 0; i < popovers.length; i++) {
    if (popovers[i].id !== targetId) {
      popovers[i].classList.remove('is-open');
    }
  }

  for (i = 0; i < buttons.length; i++) {
    if (buttons[i].id !== buttonId) {
      buttons[i].classList.remove('is-selected');
    }
  }
}

window.togglePopover = togglePopover;

document.getElementById('buttonAdaptiveControls').addEventListener('click', togglePopover);
document.getElementById('closeAdaptiveControls').addEventListener('click', togglePopover);

document.getElementById('buttonAnalysisColorSpace').addEventListener('click', togglePopover);
document.getElementById('closeAnalysisColorSpace').addEventListener('click', togglePopover);

document.getElementById('buttonShareOptions').addEventListener('click', togglePopover);
document.getElementById('closeShareOptions').addEventListener('click', togglePopover);

module.exports = {
  togglePopover
};
