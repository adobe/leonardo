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

const globals = require('globals');

module.exports = [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {
      // Disallow the comma operator (sequences), which obscures intent and is
      // easy to accidentally wrap in extra parentheses. Use separate statements.
      'no-sequences': 'error',

      // Enforce ES module syntax so the codebase stays consistent with the
      // ESM-only @adobe/leonardo-contrast-colors package.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="require"]',
          message: 'Use import statements instead of require().'
        },
        {
          selector: 'AssignmentExpression[left.object.name="module"][left.property.name="exports"]',
          message: 'Use export statements instead of module.exports.'
        }
      ]
    }
  }
];
