function create3dChartWidth() {
  var leftPanel = 304;
  var rightPanel = 240;
  var paddings = 72;
  var offset = leftPanel + rightPanel + paddings;
  var viewportWidth = getViewport()[0];

  return (viewportWidth - offset);
}
function create3dChartHeight() {
  var headerHeight = 58;
  var tabHeight = 48;
  var paddings = 164/2;
  var offset = headerHeight + tabHeight + paddings;
  var viewportHeight = getViewport()[1];

  return (viewportHeight - offset);
  // return 180;
}
var chartWidth = create3dChartWidth();
var chartHeight = create3dChartHeight();
var origin = [chartWidth/1.85, chartHeight/1.5], j = 10, scale = 30, scatter = [], yLine = [], xGrid = [], beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/10;
var dest = document.getElementById('3dchart');
dest.style.width = chartWidth;
dest.style.height = chartHeight;
var svg    = d3.select(dest).call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
// var color  = d3.scaleOrdinal(d3.schemeCategory10);
// var color = d3.scaleOrdinal(colors);

var mx, my, mouseX, mouseY;

var grid3d = d3._3d()
    .shape('GRID', 20)
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var point3d = d3._3d()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .z(function(d){ return d.z; })
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

function processData(data, tt){
    var color = d3.scaleOrdinal(colors);

    /* ----------- GRID ----------- */

    var xGrid = svg.selectAll('path.grid').data(data[0], key);

    xGrid
        .enter()
        .append('path')
        .attr('class', '_3d grid')
        .merge(xGrid)
        .attr('d', grid3d.draw);

    xGrid.exit().remove();

    /* ----------- POINTS ----------- */

    var points = svg.selectAll('circle').data(data[1], key);

    points
        .enter()
        .append('circle')
        .attr('class', '_3d')
        .attr('opacity', 0)
        .attr('cx', posPointX)
        .attr('cy', posPointY)
        .merge(points)
        .transition().duration(tt)
        .attr('r', 5)
        // .attr('stroke', function(d){ return d3.color(color(d.id)).darker(3); })
        .attr('fill', function(d){ return color(d.id); })
        .attr('opacity', 1)
        .attr('cx', posPointX)
        .attr('cy', posPointY);

    points.exit().remove();

    /* ----------- y-Scale ----------- */

    var yScale = svg.selectAll('path.yScale').data(data[2]);

    yScale
        .enter()
        .append('path')
        .attr('class', '_3d yScale')
        .merge(yScale)
        .attr('stroke', '#6e6e6e')
        .attr('stroke-width', .5)
        .attr('d', yScale3d.draw);

    yScale.exit().remove();

     /* ----------- y-Scale Text ----------- */

    var yText = svg.selectAll('text.yText').data(data[2][0]);

    yText
        .enter()
        .append('text')
        .attr('class', '_3d yText')
        .attr('dx', '.3em')
        .merge(yText)
        .each(function(d){
            d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
        })
        .attr('x', function(d){ return d.projected.x; })
        .attr('y', function(d){ return d.projected.y; })
        .text(function(d){ return d[1]*10 <= 0 ? d[1]*-10 : ''; });
        // .text(function(d) {return d;});

    yText.exit().remove();

    d3.selectAll('._3d').sort(d3._3d().sort);
}

function posPointX(d){
    return d.projected.x;
}

function posPointY(d){
    return d.projected.y;
}

var pi = Math.PI;
function init3dChart(){
    // console.log(labFullData.z);

    var cnt = 0;
    xGrid = [], scatter = [], yLine = [], colorPlot = [];
    // Taking J from origin argument...
    // z = -10; z < 10; z++ is what it's saying.
    for(var z = -j; z < j; z++){
        for(var x = -j; x < j; x++){
            xGrid.push([x, 1, z]);
            // This is where the point data is gathered:
            scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++});
            // dividing LAB data by 10 to fit current grid. Negative y var since chart is in negative space?
            // colorPlot.push({x: LABArrayA[j]/10, y: LABArrayL[j]/10 * -1, z: LABArrayB[j]/10, id: 'point_' + cnt++});
        }
    }
    if(spaceOpt == 'CAM02') {
      for(i=0; i<CAMArrayA.length; i++) {
        colorPlot.push({x: CAMArrayA[i]/10, y: CAMArrayJ[i]/10 * -1, z: CAMArrayB[i]/10, id: 'point_' + cnt++});
      }
    }
    if(spaceOpt == 'LCH') {
      for(i=0; i<LCHArrayC.length; i++) {
        colorPlot.push({x: LCHArrayC[i]/10 - 7, y: LCHArrayL[i]/10 * -1, z: LCHArrayH[i]/(10*pi) - 10, id: 'point_' + cnt++});
      }
    }
    if(spaceOpt == 'LAB') {
      for(i=0; i<LABArrayA.length; i++) {
        colorPlot.push({x: LABArrayA[i]/10, y: LABArrayL[i]/10 * -1, z: LABArrayB[i]/10, id: 'point_' + cnt++});
      }
    }
    if(spaceOpt == 'HSL') {
      for(i=0; i<HSLArrayL.length; i++) {
        colorPlot.push({x: HSLArrayH[i]/(10*pi) - 7, y: HSLArrayL[i]*10 * -1, z: HSLArrayS[i]*10 - 7, id: 'point_' + cnt++});
      }
    }
    if(spaceOpt == 'HSLuv') {
      for(i=0; i<HSLuvArrayL.length; i++) {
        colorPlot.push({x: HSLuvArrayL[i]/(10*pi) - 7, y: HSLuvArrayV[i]/10 * -1, z: HSLuvArrayV[i]/10 -7, id: 'point_' + cnt++});
      }
    }
    if(spaceOpt == 'HSV') {
      for(i=0; i<HSVArrayL.length; i++) {
        colorPlot.push({x: HSVArrayH[i]/(10*pi) - 7, y: HSVArrayL[i]*10 * -1, z: HSVArrayS[i]*10 -7, id: 'point_' + cnt++});
      }
    }
    if(spaceOpt == 'RGB') {
      for(i=0; i<RGBArrayR.length; i++) {
        colorPlot.push({x: RGBArrayR[i]/25.5 - 7, y: RGBArrayG[i]/25.5 * -1, z: RGBArrayB[i]/25.5 - 10, id: 'point_' + cnt++});
      }
    }

    d3.range(-1, 11, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });

    var data = [
        grid3d(xGrid),
        point3d(colorPlot),
        yScale3d([yLine])
    ];

    processData(data, 100);
}

function dragStart(){
    mx = d3.event.x;
    my = d3.event.y;
}

function dragged(){
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta   = (d3.event.x - mx + mouseX) * Math.PI / 600 ;
    alpha  = (d3.event.y - my + mouseY) * Math.PI / 600  * (-1);
    var data = [
         grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(colorPlot),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
    ];
    processData(data, 0);
}

function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}

// d3.selectAll('button').on('click', init3dChart);

init3dChart();
