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

function createTable(headers, rows, destId, quiet = false) {
  let dest = document.getElementById(destId);

  let table = document.createElement('table');
  table.className = quiet ? 'spectrum-Table spectrum-Table--sizeM spectrum-Table--quiet' : 'spectrum-Table spectrum-Table--sizeM';
  let tHead = document.createElement('thead');
  tHead.className = 'spectrum-Table-head';
  let hTr = document.createElement('tr');
  let tBody = document.createElement('tbody');
  tBody.className = 'spectrum-Table-body';

  for (let i = 0; i < headers.length; i++) {
    let head = document.createElement('th');
    head.className = 'spectrum-Table-headCell';
    head.innerHTML = headers[i];

    hTr.appendChild(head);
  }

  for (let i = 0; i < rows.length; i++) {
    let row = document.createElement('tr');
    row.className = 'spectrum-Table-row';

    for (let j = 0; j < rows[i].length; j++) {
      let item = document.createElement('td');
      item.className = 'spectrum-Table-cell';
      item.innerHTML = rows[i][j];

      row.appendChild(item);
    }

    tBody.appendChild(row);
  }

  tHead.appendChild(hTr);
  table.appendChild(tHead);
  table.appendChild(tBody);

  dest.appendChild(table);
}

module.exports = {
  createTable
};
