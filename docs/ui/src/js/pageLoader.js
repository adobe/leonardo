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

function pageLoader() {
  const loader = document.getElementById('pageLoader');
  const page = document.getElementById('page');
  setTimeout(() => {
    page.style.opacity = 1;
  }, 50);

  setTimeout(() => {
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.remove();
    }, 150);
  }, 1000);
}

module.exports = {
  pageLoader
};
