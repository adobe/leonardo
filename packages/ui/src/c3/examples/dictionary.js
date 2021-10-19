c3.load("../data/xkcd/c3_data.json");

var C = c3.color.length,
    W = c3.terms.length,
    map = {};
for (var i=0; i<W; ++i) {
  map[c3.terms[i]] = i;
}

$(function() {
  for (var w=0; w<W; ++w) {
    c3.terms.center[w].examples = c3.terms.relatedColors(w, 16);
    c3.terms.center[w].examples.sort(function(a, b) {
      a = c3.color[a.index]; b = c3.color[b.index];
      return b.L-a.L || b.b-a.b || b.a-a.a;
   });
  }
  var words = c3.terms.slice(); words.sort();
  $("#input").autocomplete({
    source: words,
    delay: 0
  });
  $("#input").bind("autocompleteclose", update);
  var q = location.hash.slice(1);
  if (q && q.length > 0) {
    d3.select("#input").property("value", q);
    update();
  }
});

function set(w) {
  d3.select("#input").property("value", c3.terms[w]);
  update();
}

function update() {
  var term = d3.select("#input").property("value").toLowerCase(),
      idx = map[term];
  if (idx === undefined) {
    d3.selectAll("div.output").html("");
    d3.select(".ctrl").style("display", "none");
    location.hash = null;
    return;
  }
  d3.selectAll("div.output").selectAll("*").remove();
  d3.select(".ctrl").style("display", "block");

  // create dictionary swatches
  var ex = c3.terms.center[idx].examples,
      cl = [], cur = [];
  for (var i=0, k=1; i<ex.length; ++i, ++k) {
      cur.push(ex[i]);
      if (k % 4 == 0) { cl.push(cur); cur = []; k=0; }
  }
  var dt = d3.select("#dict").append("table").attr("class","dict")
    .selectAll("tr")
      .data(cl)
    .enter().append("tr");
  var td = dt.selectAll("td")
     .data(function(d) { return d; }).enter()
    .append("td")
     .attr("class", "miniswatch");
  td.append("div")
     .attr("class", "dswatch")
     .style("background-color", function(c) { return c3.color[c.index]; })
     .html("&nbsp;");
  td.append("div")
     .attr("class", "hex")
     .text(function(c) { return c3.color[c.index]; });

  // create thesaurus table
  // d3.select("#output").append("h3").text("Thesaurus");
  // var terms = c3.terms.relatedTerms(idx); terms.shift();
  // var tr = d3.select("#output").append("table").selectAll("tr")
  //     .data(terms)
  //   .enter().append("tr");
  // tr.append("td").attr("class", "miniswatch").append("div")
  //   .attr("class", "dswatch")
  //   .style("background-color", function(d) { return c3.terms.center[d.index]; });
  // tr.append("td").attr("class", "name").append("a")
  //   .attr("href", function(d) { return "javascript:set("+d.index+");"; })
  //   .text(function(d) { return c3.terms[d.index]; });
  // tr.append("td")
  //   .attr("class", "hex")
  //   .text(function(d) { return c3.terms.center[d.index]; });

  var rel = c3.terms.relatedTerms(idx), num = 8;

  // create similar terms table
  d3.select("#sim").append("h3").text("Similar Colors");
  var sim = rel.slice(1, num+1);
  var tr = d3.select("#sim").append("table")
      .attr("class", "thesaurus")
    .selectAll("tr")
      .data(sim)
    .enter().append("tr");
  tr.append("td").attr("class", "miniswatch").append("div")
    .attr("class", "dswatch")
    .style("background-color", function(d) { return c3.terms.center[d.index]; });
  tr.append("td").attr("class", "name").append("a")
    .attr("href", function(d) { return "javascript:set("+d.index+");"; })
    .text(function(d) { return c3.terms[d.index]; });
  tr.append("td")
    .attr("class", "hex")
    .text(function(d) { return c3.terms.center[d.index]; });

  // create dissimlar terms table
  d3.select("#dis").append("h3").text("Opposite Colors");
  var dis = rel.slice(rel.length-num, rel.length).reverse();
  var tr = d3.select("#dis").append("table")
      .attr("class", "thesaurus")
    .selectAll("tr")
      .data(dis)
    .enter().append("tr");
  tr.append("td").attr("class", "miniswatch").append("div")
    .attr("class", "dswatch")
    .style("background-color", function(d) { return c3.terms.center[d.index]; });
  tr.append("td").attr("class", "name").append("a")
    .attr("href", function(d) { return "javascript:set("+d.index+");"; })
    .text(function(d) { return c3.terms[d.index]; });
  tr.append("td")
    .attr("class", "hex")
    .text(function(d) { return c3.terms.center[d.index]; });

  location.hash = term;
}