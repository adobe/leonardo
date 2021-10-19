function init() {
  // init drop-down menu selector
  d3.select("#selector")
      .on("change", updateSelector)
    .selectAll("option.auto")
      .data(plist)
    .enter().append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return pname[d]; });

  // init free-text entry textarea
  d3.select("#palette")
    .text("Enter a comma-separated list of hex values here and type \"Return\"\n" +
          " OR choose a pre-specified palette from the drop down menu.")
    .on("keydown", function() {
      if (d3.event.keyCode == 13) { // return
        var p = parsePalette();
        if (p) analyze("Custom", p);
		else alert("Unable to parse palette colors!");
        d3.event.preventDefault();
      }
    });

  // build lookup table
  var map = (self.map = {});
  for (var c=0; c<c3.color.length; ++c) {
	var x = c3.color[c];
    map[[x.L,x.a,x.b].join(",")] = c;
  }
}

function updateSelector() {
  var val = this.value,
      palette = palettes[val],
      name = pname[val] || "Custom";
  if (!palette) {
    d3.select("#palette").property("value", "");
  } else {
    d3.select("#palette").property("value", palette.join(", "));
    analyze(name, palette);
  }
}

function parsePalette() {
  var hex = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
  var t = d3.select("#palette").property("value");
  var p = t.split(' ').join('').split(',');
  for (var i=0; i<p.length; ++i) {
    if (!hex.test(p[i])) return false;
  }
  return p;
}

function index(c) {
  var x = d3.lab(c),
      L = 5 * Math.round(x.L/5),
      a = 5 * Math.round(x.a/5),
      b = 5 * Math.round(x.b/5),
      s = [L,a,b].join(",");
  return map[s];
}

function analyze(name, palette) {
  // NOTE: entropy min/max currently hard-wired to XKCD results
  self.minE = -4.5;
  self.maxE = 0;

  d3.select("#analysis").remove();
  var data = palette.map(color);
  var div = d3.select("body").append("div").attr("id", "analysis");
  var cells = data.length * (data.length - 1) / 2;

  var tdiv = div.append("div")
      .style("position", "relative")
      .style("margin-bottom", "4px")
      .html("&nbsp;");
  tdiv.append("span").text("Color Name Distance")
      .style("position","absolute").style("left", 0);
  tdiv.append("span").text("Salience")
      .style("position","absolute").style("left", (data.length*36+10)+"px");
  tdiv.append("span").text("Name")
      .style("position","absolute").style("left", (data.length*36+70)+"px");

  var norm_name = 0;
  for (var i=0; i<data.length; ++i) {
	var row = div.append("div").attr("class","row");
    for (var j=0; j<data.length; ++j) {
      var x = 1 - c3.color.cosine(data[i].c, data[j].c);
      var e = row.append("div").text(x.toFixed(2));
      if (i == j) e.style("font-weight", "bold")
                   .style("background-color", data[i].x);
      else if (x <= 0.4) e.style("color", "#a00");
      else if (x >= 0.8) e.style("color", "#ccc");
      e.style("padding-right", "5px");
      if (j > i) { norm_name += x; }
    }
    var d = data[i];

    var sdiv = row.append("div")
      .style("position", "relative")
      .style("top", "1px")
      .style("margin-left", "10px")
      .style("background-color", "#f2f2f2")
      .style("width", "50px")
      .style("height", "12px")
      .html("&nbsp");

    sdiv.append("div")
      .style("position", "absolute")
      .style("left", 0)
      .style("top", 0)
      .style("background-color", "#ccc")
      .style("height", "100%")
      .style("width", Math.round(d.h * 50)+"px")
      .html("&nbsp;");

    sdiv.append("div")
      .style("position", "absolute")
      .style("right", "0px")
      .style("top", "0px")
      .html(d.h.toFixed(2).substring(1)+"&nbsp;");

    row.append("div").attr("class","terms").html(
	  d.terms.map(function(s) { 
        return "<span class='term'>"+c3.terms[s.index]+"</span>" +
              " <span class='perc'>"+(100*s.score).toFixed(1)+"%</span>";
	  }).join(", "));
  }
  norm_name = norm_name / cells;

  var sal = data.map(function(d) { return d.h; }); sal.sort();
  var norm_sal = sal.reduce(function(a,b) { return a+b; }, 0) / sal.length;

  var dt = div.append("div").attr("class", "title")
     .style("position","relative");
  dt.append("span").attr("class","pname").text(name)
    .style("position","absolute").style("left", 0)
  dt.append("div").html("Average &nbsp; "+ norm_name.toFixed(2))
    .style("position", "absolute").style("left", (data.length*36-80)+"px")
    .style("top", "1px").style("font-style", "italic");
  dt.append("div").html(norm_sal.toFixed(2).substring(1))
    .style("position", "absolute").style("left", (data.length*36+40)+"px")
    .style("top", "1px").style("font-style", "italic");

}

function color(x) {
  var c = index(x),
      h = (c3.color.entropy(c) - minE) / (maxE - minE),
      t = c3.color.relatedTerms(c, 1);
  var z = d3.lab(x); z = ~~(z.L)+", "+~~(z.a)+", "+~~(z.b);
  return {"x":x, "c":c, "h":h, terms:t, "z": z};
}