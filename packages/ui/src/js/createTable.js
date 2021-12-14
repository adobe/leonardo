function createTable(headers, rows, destId) {
  let dest = document.getElementById(destId);
  // headers will be array
  // ['title', 'title', 'title']

  // rows argument will be an array OF arrays
  // [ 
  //   ['item', 'item', 'item'],
  //   ['item', 'item', 'item']
  // ]

  let table = document.createElement('table');
  table.className = "spectrum-Table spectrum-Table--sizeM";
  let tHead = document.createElement('thead')
  tHead.className = 'spectrum-Table-head';
  let hTr = document.createElement('tr');
  let tBody = document.createElement('tbody');
  tBody.className = 'spectrum-Table-body';

  for(let i = 0; i < headers.length; i++) {
    let head = document.createElement('th');
    head.className = 'spectrum-Table-headCell';
    head.innerHTML = headers[i];

    hTr.appendChild(head);
  }

  for(let i = 0; i < rows.length; i++) {
    let row = document.createElement('tr');
    row.className = 'spectrum-Table-row';

    for(let j=0; j < rows[i].length; j++) {
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
}