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

import {themeUpdate} from './themeUpdate';

function showToast() {
  let toast = document.getElementById('toastCVDpreview');
  if (toast.classList.contains('is-visible')) {
    // do nothing
  } else {
    toast.classList.remove('spectrum-Exit');
    toast.classList.add('spectrum-Bounce');
    toast.classList.add('is-visible');
  }
}

function hideToast() {
  let toast = document.getElementById('toastCVDpreview');
  toast.classList.remove('spectrum-Bounce');
  toast.classList.add('spectrum-Exit');
  toast.classList.remove('is-visible');
}

function exitPreview() {
  cvdModeDropdown.value = 'None';

  themeUpdate();
  hideToast();
}

function neverShowToast() {
  let toast = document.getElementById('toastCVDpreview');
  toast.classList.remove('spectrum-Bounce');
  toast.classList.add('spectrum-Exit');
  toast.classList.remove('is-visible');
  toast.classList.add('hidden');
}

window.showToast = showToast;
window.hideToast = hideToast;
window.exitPreview = exitPreview;
window.neverShowToast = neverShowToast;

module.exports = {
  showToast,
  hideToast,
  exitPreview,
  neverShowToast
};
