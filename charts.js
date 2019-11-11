var origin = [300, 300], j = 10, scale = 20, scatter = [], yLine = [], xGrid = [], beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/8;
var dest = document.getElementById('3dchart');
var svg    = d3.select(dest).call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
// var color  = d3.scaleOrdinal(d3.schemeCategory10);
var color = d3.scaleLinear()
              .range(colors)
              .domain([0, 10]);

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
        .attr('r', 3)
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
        .attr('stroke', 'black')
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
        .text(function(d){ return d[1] <= 0 ? d[1] : ''; });

    yText.exit().remove();

    d3.selectAll('._3d').sort(d3._3d().sort);
}

function posPointX(d){
    return d.projected.x;
}

function posPointY(d){
    return d.projected.y;
}

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
    for(i=0; i<CAMArrayA.length; i++) {
      colorPlot.push({x: CAMArrayA[i]/10, y: CAMArrayJ[i]/10 * -1, z: CAMArrayB[i]/10, id: 'point_' + cnt++});
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
