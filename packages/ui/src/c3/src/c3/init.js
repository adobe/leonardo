function c3_init(json) {
  var i, C, W, T, A, ccount, tcount;

  // parse colors
  c3.color = [];
  for (i=0; i<json.color.length; i+=3) {
    c3.color[i/3] = d3.lab(json.color[i], json.color[i+1], json.color[i+2]);
  }
  C = c3.color.length;

  // parse terms
  c3.terms = json.terms;
  W = c3.terms.length;

  // parse count table
  c3.T = T = [];
  for (var i=0; i<json.T.length; i+=2) {
    T[json.T[i]] = json.T[i+1];
  }

  // construct counts
  c3.color.count = ccount = []; for (i=0; i<C; ++i) ccount[i] = 0;
  c3.terms.count = tcount = []; for (i=0; i<W; ++i) tcount[i] = 0;
  d3.keys(T).forEach(function(idx) {
    var c = Math.floor(idx / W),
        w = Math.floor(idx % W),
        v = T[idx] || 0;
    ccount[c] += v;
    tcount[w] += v;
  });

  // parse word association matrix
  c3.A = A = json.A;
}

