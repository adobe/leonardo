(function(){c3 = {version: "1.0.0"}; // semver

c3.load = function(uri, async) {
  async = async || false;
  var req = new XMLHttpRequest();
  var onload = function() {
    if (!async || req.readyState == 4) {
      if (req.status == 200 || req.status == 0) {
        c3_init(JSON.parse(req.responseText));
        c3_api();
      } else {
        alert("Error Loading C3 Data");
      }
    }
  };
  req.open('GET', uri, false);
  if (async) req.onreadystatechange = onload;
  req.send(null);
  if (!async) onload();
}

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

function c3_api() {
  var C = c3.color.length,
      W = c3.terms.length,
      T = c3.T,
      A = c3.A,
      ccount = c3.color.count,
      tcount = c3.terms.count;

  c3.count = function(c, w) {
    return T[c*W+w] || 0;
  }

  c3.terms.prob = function(w, c) {
    return (T[c*W+w]||0) / tcount[w];
  }

  c3.terms.entropy = function(w) {
    var H = 0, p;
    for (var c=0; c<C; ++c) {
      p = (T[c*W+w]||0) / tcount[w];
      if (p > 0) H += p * Math.log(p) / Math.LN2;
    }
    return H;
  }

  c3.terms.perplexity = function(w) {
    var H = c3.terms.entropy(w);
    return Math.pow(2, -H);
  }

  c3.terms.cosine = function(a, b) {
    var sa=0, sb=0, sc=0, ta, tb;
    for (var c=0; c<C; ++c) {
      ta = (T[c*W+a]||0);
      tb = (T[c*W+b]||0);
      sa += ta*ta;
      sb += tb*tb;
      sc += ta*tb;
    }
    return sc / (Math.sqrt(sa*sb));
  }

  c3.color.prob = function(c, w) {
    return (T[c*W+w]||0) / ccount[c];
  }

  c3.color.entropy = function(c) {
    var H = 0, p;
    for (var w=0; w<W; ++w) {
      p = (T[c*W+w]||0) / ccount[c];
      if (p > 0) H += p * Math.log(p) / Math.LN2;
    }
    return H;
  }

  c3.terms.hellinger = function(a, b) {
    var bc=0, pa, pb, z = Math.sqrt(tcount[a]*tcount[b]);
    for (var c=0; c<C; ++c) {
      pa = (T[c*W+a]||0);
      pb = (T[c*W+b]||0);
      bc += Math.sqrt(pa*pb);
    }
    return Math.sqrt(1 - bc / z);
  }

  c3.color.perplexity = function(c) {
    var H = c3.color.entropy(c);
    return Math.pow(2, -H);
  }

  c3.color.cosine = function(a, b) {
    var sa=0, sb=0, sc=0, ta, tb;
    for (var w=0; w<W; ++w) {
      ta = (T[a*W+w]||0);
      tb = (T[b*W+w]||0);
      sa += ta*ta;
      sb += tb*tb;
      sc += ta*tb;
    }
    return sc / (Math.sqrt(sa*sb));
  }

  c3.color.hellinger = function(a, b) {
    var bc=0, pa, pb, z = Math.sqrt(ccount[a]*ccount[b]);
    for (var w=0; w<W; ++w) {
      pa = (T[a*W+w]||0);
      pb = (T[b*W+w]||0);
      bc += Math.sqrt(pa*pb);
    }
    return Math.sqrt(1 - bc / z);
  }

  c3.terms.relatedTerms = function(w, limit) {
    var sum = 0, c = c3.terms.center[w], list = [];
    for (var i=0; i<W; ++i) {
      if (i != w) list.push({index: i, score: A[i*W+w]});
    }
    list.sort(function(a, b) {
	  var ca, cb, dL1, dL2, da1, da2, db1, db2,
          cmp = b.score - a.score;
      if (Math.abs(cmp) < 0.00005) {
        // break near ties by distance between centers
        ca = c3.terms.center[a.index];
        cb = c3.terms.center[b.index];
        cmp = ca.de00(c) - cb.de00(c);
      }
      return cmp;
    });
    list.unshift({index: w, score: A[w*W+w]});
    return limit ? list.slice(0,limit) : list;
  }

  c3.terms.relatedColors = function(w, limit) {
    var list = [];
    for (var c=0; c<C; ++c) {
      var s = (T[c*W+w] || 0) / ccount[c];
      if (s > 0) list.push({index: c, score: s});
    }
    list.sort(function(a,b) { return b.score - a.score; });
    return limit ? list.slice(0,limit) : list;
  }

  c3.color.relatedTerms = function(c, limit, minCount) {
    var cc = c*W, list = [], sum = 0, s, cnt = c3.terms.count;
    for (var w=0; w<W; ++w) {
      if ((s = T[cc+w]) !== undefined) {
        list.push({index: w, score: s});
        sum += s;
      }
    }
    if (minCount) {
      list = list.filter(function(d) { return cnt[d.index] > minCount; });
    }
    list.sort(function(a,b) { return b.score - a.score; });
    list.forEach(function(d) { d.score /= sum; });
    return limit ? list.slice(0, limit) : list;
  }

  // compute representative colors
  c3.terms.center = d3.range(W).map(function(w) {
    var list = c3.terms.relatedColors(w, 5)
                 .map(function(d) { return c3.color[d.index]; });
	var L = 0, a = 0, b = 0, N = list.length;
	list.forEach(function(c) { L += c.L; a += c.a; b += c.b; });
	return d3.lab(Math.round(L/N), Math.round(a/N), Math.round(b/N));
  });
}

})();
