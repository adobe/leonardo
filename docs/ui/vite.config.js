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

import {resolve, dirname} from 'path';
import {copyFileSync, mkdirSync, existsSync} from 'fs';
import {fileURLToPath} from 'url';
import handlebars from 'vite-plugin-handlebars';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Copy Spectrum icon SVGs from node_modules to public so they are served and copied to dist. */
function copySpectrumIcons() {
  const publicDir = resolve(__dirname, 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, {recursive: true});
  const nodeModules = resolve(__dirname, 'node_modules');
  try {
    copyFileSync(resolve(nodeModules, '@adobe/spectrum-css-workflow-icons/dist/spectrum-icons.svg'), resolve(publicDir, 'spectrum-icons.svg'));
    copyFileSync(resolve(nodeModules, '@spectrum-css/icon/dist/spectrum-css-icons.svg'), resolve(publicDir, 'spectrum-css-icons.svg'));
  } catch (e) {
    console.warn('Could not copy Spectrum icon SVGs (run pnpm install):', e.message);
  }
}

function copySpectrumIconsPlugin() {
  copySpectrumIcons(); // run when plugin loads (dev and build)
  return {
    name: 'copy-spectrum-icons',
    buildStart: copySpectrumIcons
  };
}

export default {
  base: './',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        api: resolve(__dirname, 'src/api.html'),
        articles: resolve(__dirname, 'src/articles.html'),
        aiTools: resolve(__dirname, 'src/ai-tools.html'),
        theme: resolve(__dirname, 'src/theme.html'),
        scales: resolve(__dirname, 'src/scales.html'),
        tools: resolve(__dirname, 'src/tools.html'),
        demo: resolve(__dirname, 'src/demo.html')
      }
    }
  },
  plugins: [
    copySpectrumIconsPlugin(),
    handlebars({
      partialDirectory: resolve(__dirname, 'src/views')
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  resolve: {
    alias: {
      hsluv: resolve(__dirname, 'node_modules/hsluv/dist/hsluv.mjs')
    }
  }
};
