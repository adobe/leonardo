var imageLoaded = false, image = null, imageIndex,
    colorindex = {}, chipindex = {}, colormax,
    desaturate = true, invert = false, stimer = null,
    term = {index: undefined, pos: -1}, topterms, curterms,
    mask = {}, tool = 1, mx = -1, my = -1;

var imageFiles = [
  "images/forest.jpg",
  "images/poppies.jpg",
  "images/simpsons.jpg",
  "images/soleil.jpg",
  "images/starry.jpg",
  "images/sunday.jpg",
  "images/suprematism.jpg",
  "images/wave.jpg"
];

function slide() {
  var v;
  if (tool == 0) {
    d3.select("#crlabel").text(d3.select("#crange").property("value"));
    d3.select("#nrlabel").text(d3.select("#nrange").property("value"));
    if (imageLoaded) {
      if (stimer) clearTimeout(stimer);
      stimer = setTimeout(function() { fill(mx,my); }, 50);
    }
  } else {
    d3.select("#rlabel").text(d3.select("#range").property("value"));
    if (imageLoaded) {
      if (stimer) clearTimeout(stimer);
      stimer = setTimeout(search, 50);
    }
  }
}

function maskt() {
  desaturate = !d3.select("#check").property("checked");
  if (imageLoaded) { paint(); }
}

function subtract() {
  invert = d3.select("#subtract").property("checked");
  if (imageLoaded) { paint(); }
}

function settool() {
  var name = d3.select("#tool").property("value"),
      code = (name == "wand" ? 0 : 1);
  if (tool == code) return;
  tool = code;
  d3.selectAll(".wand").classed("hide", tool!=0);
  d3.selectAll(".pick").classed("hide", tool==0);
  mx = my = -1;
}

function load() {
  var uri = d3.select("#uri").property("value");
  image = new Image();
  image.src = uri;
  image.onload = function() {
    var ctx = d3.select("#canvas")[0][0].getContext('2d');
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 2000, 2000)
    ctx.drawImage(image, 0, 0);
    imageLoaded = true;
    indexImage(ctx);
    update();
  }
}

function indexImage(ctx) {
  var W = image.width, H = image.height,
      d = ctx.getImageData(0, 0, W, H),
      r, g, b, c, cx, cy, cz, s, pos = 0;

  // D65 standard referent
  var X = 0.950470, Y = 1.0, Z = 1.088830;
  
  imageIndex = [];
  var chips = [];
  for (c=0; c<c3.color.length; ++c) chips[c] = 0;

  for (var i=0; i<W*H; ++i) imageIndex[i] = -1;
  for (var y=0, yy=0; y<H; yy=(++y)*W) {
    for (var x=0; x<W; ++x, pos+=4) {
      // inline RGB->LAB transform for speed-up

      // first, normalize RGB values
      r = d.data[pos]   / 255.0;
      g = d.data[pos+1] / 255.0;
      b = d.data[pos+2] / 255.0;

      // second, map sRGB to CIE XYZ
      r = r <= 0.04045 ? r/12.92 : Math.pow((r+0.055)/1.055, 2.4);
      g = g <= 0.04045 ? g/12.92 : Math.pow((g+0.055)/1.055, 2.4);
      b = b <= 0.04045 ? b/12.92 : Math.pow((b+0.055)/1.055, 2.4);
      cx = (0.4124564*r + 0.3575761*g + 0.1804375*b) / X,
      cy = (0.2126729*r + 0.7151522*g + 0.0721750*b) / Y,
      cz = (0.0193339*r + 0.1191920*g + 0.9503041*b) / Z;

      // third, map CIE XYZ to CIE L*a*b* and return
      cx = cx > 0.008856 ? Math.pow(cx, 1.0/3) : 7.787037*cx + 4.0/29;
      cy = cy > 0.008856 ? Math.pow(cy, 1.0/3) : 7.787037*cy + 4.0/29;
      cz = cz > 0.008856 ? Math.pow(cz, 1.0/3) : 7.787037*cz + 4.0/29;

      // fourth, bin and perform lookup
      s = (5 * Math.round((116*cy - 16)/5)) + "," +
          (5 * Math.round(100*(cx-cy))) + "," +
          (5 * Math.round(40*(cy-cz)));
      c = chipindex[s];
      imageIndex[yy+x] = c;
      chips[c] += 1;
    }
  }

  W = c3.terms.length;
  var termscore = d3.range(0,W).map(function() { return 0; });
  colormax = d3.range(0,W).map(function() { return 0; });
  for (var i=0; i<c3.color.length; ++i) {
    if (chips[i] < 1) continue;
    cc = i * W;
    for (var w=0; w<W; ++w) {
      x = c3.T[cc+w] || 0;
      if (x > colormax[w]) colormax[w] = x;
      if (x > 0) termscore[w] += chips[i];
    }
  }
  topterms = termscore.map(function(d,i) { return {index:i, score:d}; });
  topterms.sort(function(a,b) { return b.score - a.score; });
  topterms = topterms.slice(0,25);
}

function region(x, y, w, h) {
  if (image == null) return;
  var w = x+w, h = y+h, xx, yy, W = image.width, c, cc, chips = [];
  for (c=0; c<c3.color.length; ++c) chips[c] = 0;

  // tally colors in selection region
  var count = 0;
  for (yy=y*W; y<h; yy=(++y)*W) {
    for (xx=x; xx<w; ++xx) {
      chips[imageIndex[yy+xx]] += 1;
      ++count;
    }
  }

  W = c3.terms.length;
  var termscore = d3.range(0,W).map(function() { return 0; });
  for (c=0; c<c3.color.length; ++c) {
    if (chips[c] < 1) continue;
    cc = c * W;
    for (w=0; w<W; ++w) {
      x = c3.T[cc+w] || 0;
      if (x > 0) termscore[w] += x*chips[c];
    }
  }
  topterms = [];
  termscore.forEach(function(d,i) {
    if (d > 0) topterms.push({index:i, score:d});
  });
  topterms.sort(function(a,b) { return b.score - a.score; });
  topterms = topterms.slice(0,25);
}

function set(w, pos, rel) {
  d3.select("#colorname").property("value", c3.terms[w]);
  term = {index:w, pos:pos};
  update(rel ? true : false);
}

function getTerms(w, related) {
  return (curterms = (related ? c3.terms.relatedTerms(w, 25) :
    curterms ? curterms : topterms));
}

function query() {
  var w = colorindex[d3.select("#colorname").property("value")];
  term = {index:w, pos:0};
  update(true);
}

function update(related) {
  var w = term.index;
  if (w === undefined) {
    d3.select("#canvas")[0][0].getContext('2d').drawImage(image, 0, 0);
    if (!imageLoaded) return;
  }
  d3.select("#terms").select("table").remove();
  var tr = d3.select("#terms").append("table").selectAll("tr")
      .data(getTerms(w, related))
    .enter().append("tr");
  tr.on("mouseover", function(d, i) {
    d3.select(this).attr("class", "selected");
  });
  tr.on("mouseout", function(d, i) {
    d3.select(this).attr("class", null);
  });
  tr.append("td").attr("class","swatch").selectAll("div")
    .data(function(d) { return c3.terms.center[d.index].examples; })
   .enter().append("div")
    .attr("class", "miniswatch")
    .style("background-color", function(c) { return c3.color[c.index]; });
  var link = tr.append("td").attr("class", "name");
  link.append("a")
    .attr("class", function(d,i) { return "link"+i; })
    .attr("href", function(d,i){return "javascript:set("+d.index+","+i+");";})
    .style("font-weight", function(d) { return w==d.index?"bold":"normal"; })
    .text(function(d) { return c3.terms[d.index]; });
  link.append("a")
    .attr("class", function(d,i) { return "rel rel"+i; })
    .attr("href", function(d,i) { return "javascript:set("+d.index+","+i+",true);";})
	.text("search");
  if (imageLoaded && w !== undefined) { search(); }
}

function paint() {
  var ctx = d3.select("#canvas")[0][0].getContext('2d');
  ctx.drawImage(image, 0, 0);

  var W = image.width, H = image.height,
      d = ctx.getImageData(0,0,W,H),
      x, y, yy, pos = 0, g = 255;

  for (y=0, yy=0; y<H; yy=(++y)*W) {
    for (x=0; x<W; ++x, pos+=4) {
	  if (!mask[y*W+x] ^ invert) {
		if (desaturate)
		  g = 0.3*d.data[pos] + 0.59*d.data[pos+1] + 0.11*d.data[pos+2];
        d.data[pos+0] = g;
        d.data[pos+1] = g;
        d.data[pos+2] = g;
        d.data[pos+3] = 255;
      }
    }
  }
  ctx.putImageData(d, 0, 0);
}

function search() {
  var ctx = d3.select("#canvas")[0][0].getContext('2d');
  ctx.drawImage(image, 0, 0);
  var W = image.width, H = image.height,
      d = ctx.getImageData(0,0,W,H),
      w = colorindex[d3.select("#colorname").property("value")],
      t = d3.select("#range").property("value"),
      T = c3.T, max = colormax, ww = c3.terms.length,
      pos = 0, c, s, g = 255;
  mask = {};

  for (var y=0, yy=0; y<H; yy=(++y)*W) {
    for (var x=0; x<W; ++x, pos+=4) {
      c = imageIndex[yy+x];
      s = (c === undefined);
      if (!s) {
        s = ~~(100*Math.pow((T[c*ww+w]||0)/max[w],0.3) + 0.5);
        s = (s > 100-t);
        if (s) mask[y*W+x] = true;
      }
    }
  }
  paint();
}

function fill(x, y) {
  var ctx = d3.select("#canvas")[0][0].getContext('2d');
  ctx.drawImage(image, 0, 0);
  var W = image.width, H = image.height,
      d = ctx.getImageData(0,0,W,H),
      ct = d3.select("#crange").property("value"),
      nt = d3.select("#nrange").property("value"),
      oi = imageIndex[y*W + x],
      oc = c3.color[oi],
      oc_rgb = oc.rgb(),
      stack = [], 
      seg, l, x1, x2, dy;
  mask = {};

  var sim = function(x, y) {
	if (mask[y*W+x]) return false;
	var idx = imageIndex[y*W+x],
        tc = c3.color[idx];

    // Uncomment this line and replace "rgb" with "lab" in the
    // return statement to use LAB DE00 color distance instead of RGB
    // However, this is much slower due to de00 distance calculation
    // var lab = ct>0 ? (idx < 0 || !tc) ? false : oc.de00(tc) < ct : 0;

    var tc_rgb = tc ? tc.argb : null;
    var diff = tc_rgb ? Math.max(
        Math.abs(tc_rgb.r - oc_rgb.r),
        Math.abs(tc_rgb.g - oc_rgb.g),
        Math.abs(tc_rgb.b - oc_rgb.b)
    ) : 0;
    var rgb = ct>0 ? diff < ct : 0;
    var name = nt>0 ? 100*(1-c3.color.cosine(oi, idx)) < nt : 0;
    return name || rgb;
  };

  // flood fill adapted from Paul Heckbert's version in Graphics Gems
  // http://tog.acm.org/resources/GraphicsGems/gems/SeedFill.c
  if (x<0 || x>=W || y<0 || y>=H) return mask;
  if (y+1 >= 0 && y+1 < H)
    stack.push([y, x, x, 1]); // needed in some cases
  if (y >= 0 && y < H)
    stack.push([y+1, x, x, -1]); // seed segment (pop 1st)

  while (stack.length > 0) {
    // pop segment off stack and fill a neighboring scan line
    seg = stack.pop();
    x1 = seg[1];
    x2 = seg[2];
    dy = seg[3];
    y  = seg[0] + dy;

    // segment of scan line y-dy for x1<=x<=x2 was previously filled,
    // now explore adjacent pixels in scan line y
    for (x=x1; x>=0 && sim(x,y); --x) {
      mask[y*W+x] = true;  // mark pixel in selection mask
    }

    if (x >= x1) {
      for (x++; x<=x2 && !sim(x, y); ++x) {}
      l = x;
      while (x <= x2) {
	    for (; x < W && sim(x,y); ++x)
          mask[y*W+x] = true;  // mark pixel in selection mask
        if (y+dy >= 0 && y+dy < H && stack.length < 10000)
          stack.push([y, l, x-1, dy]);
        if (x > x2+1 && y-dy >= 0 && y-dy < H && stack.length < 10000)
          stack.push([y, x2+1, x-1, -dy]); // right?
        for (x++; x<=x2 && !sim(x, y); ++x) {}
        l = x;
      }
    } else {
      l = x + 1;
      if (l < x1 && y-dy >= 0 && y-dy < H && stack.length < 10000)
        stack.push([y, l, x1-1, -dy]); // left?
      x = x1 + 1;
      do {
        for (; x < W && sim(x,y); ++x)
          mask[y*W+x] = true; // mark pixel in selection mask
        if (y+dy >= 0 && y+dy < H && stack.length < 10000)
          stack.push([y, l, x-1, dy]);
        if (x > x2+1 && y-dy >= 0 && y-dy < H && stack.length < 10000)
          stack.push([y, x2+1, x-1, -dy]); // right?
        for (x++; x<=x2 && !sim(x, y); ++x) {}
        l = x;
      } while (x <= x2);
    }
  }
  paint();
}

function init() {
  c3.terms.forEach(function(t,i) { colorindex[t] = i; });
  c3.color.forEach(function(c,i) {
	c.argb = c.rgb(); // cache rgb values of lab colors
    chipindex[[c.L,c.a,c.b].join(",")] = i;
  });

  for (var w=0; w<c3.terms.length; ++w) {
    c3.terms.center[w].examples = c3.terms.relatedColors(w, 25);
    c3.terms.center[w].examples.sort(function(a, b) {
      a = c3.color[a.index]; b = c3.color[b.index];
      return b.L-a.L || b.a-a.a || b.b-a.b;
    });
  }
  var words = c3.terms.slice(); words.sort();
  $("#colorname").autocomplete({source: words, delay: 0});
  $("#colorname").bind("autocompleteclose", query);
  $("#uri").autocomplete({source: imageFiles, delay: 0});
  $("#uri").bind("autocompleteclose", load);

  // direct interaction with the canvas
  var wx,  wy;
  $("#canvas").bind("mousedown", function(event) {
	mx = event.offsetX; wx = event.clientX;
	my = event.offsetY; wy = event.clientY;
	if (event.stopPropagation) event.stopPropagation();
	if (event.preventDefault) event.preventDefault();
	event.cancelBubble = true;
	event.returnValue = false;
  });
  $("#canvas").bind("mousemove", function(event) {
	if (mx < 0 || tool == 0) return;
	var nx = event.clientX, ny = event.clientY, px=wx, py=wy;
    if (nx < wx) { px = nx; nx = wx; }
    if (ny < wy) { py = ny; ny = wy; }
    d3.select("#select")
      .style("display", "block")
      .style("opacity", "1")
      .style("left", px+"px")
      .style("top", py+"px")
      .style("width", (nx-px)+"px")
      .style("height", (ny-py)+"px");
  });
  $("#canvas").bind("mouseup", function(event) {
    var nx = event.offsetX, ny = event.offsetY, tmp;
    if (nx < mx) { tmp = mx; mx = nx; nx = tmp; }
    if (ny < my) { tmp = my; my = ny; ny = tmp; }
    curterms = null;
    if (tool == 0) {
      fill(mx, my);
    } else {
      region(mx, my, (nx-mx)+1, (ny-my)+1);
      mx = my = -1;
      d3.select("#select").transition()
        .style("opacity", "0")
        .each("end", function() {
          d3.select(this).style("display", "none");
        });
      update();
    }
  });
}