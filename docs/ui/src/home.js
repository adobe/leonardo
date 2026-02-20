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

import './index.css';
import {pageLoader} from './js/pageLoader';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

// Dark mode: match system preference
const mq = window.matchMedia('(prefers-color-scheme: dark)');
function applyColorScheme() {
  document.body.classList.toggle('spectrum--darkest', mq.matches);
  document.body.classList.toggle('spectrum--light', !mq.matches);
}
mq.addEventListener('change', applyColorScheme);
applyColorScheme();

// Header tab: set aria-current and is-selected only when on index
function highlightHeaderTab() {
  const headerTab = document.querySelector('.spectrum-AppHeader a[href="index.html"]');
  if (!headerTab) return;
  const pathname = window.location.pathname;
  const isIndex = pathname.endsWith('/') || pathname.endsWith('index.html') || pathname === '' || pathname.endsWith('/index');
  if (isIndex) {
    headerTab.setAttribute('aria-current', 'page');
    headerTab.classList.add('is-selected');
  } else {
    headerTab.removeAttribute('aria-current');
    headerTab.classList.remove('is-selected');
  }
}

// Side nav: highlight current page based on pathname
function highlightDocsSideNav() {
  const nav = document.getElementById('docsSideNav');
  if (!nav) return;
  const pathname = window.location.pathname;
  const page = pathname.endsWith('api.html') ? 'api' : pathname.endsWith('articles.html') ? 'articles' : pathname.endsWith('ai-tools.html') ? 'ai-tools' : 'index';
  const currentLink = nav.querySelector(`a[data-page="${page}"]`);
  if (currentLink) {
    const item = currentLink.closest('.spectrum-SideNav-item');
    if (item) item.classList.add('is-selected');
  }
}

window.addEventListener('load', () => {
  highlightHeaderTab();
  highlightDocsSideNav();
  hljs.highlightAll();
  pageLoader();
});
