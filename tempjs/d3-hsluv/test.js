var d3 = require('d3');
var hsluv = require('./build/d3-hsluv.js')

var firstcolor = '#ffffe5';
var secondcolor = "#993404";

var color1 = hsluv.hsluv(firstcolor);
var color2 = hsluv.hsluv(secondcolor);

var breaks = 7;

var color3 = d3.hsl(firstcolor);
var color4 = d3.hsl(secondcolor);


var color5 = d3.lab(firstcolor);
var color6 = d3.lab(secondcolor);

function rgbToHex(r,g,b) {
   return '#' + (r << 16 | g << 8 | b).toString(16).toUpperCase();
}

function getLess(X) {
	var t = hsluv.hsluv(color1.l + (X * ((color2.l - color1.l) / breaks)),
		color1.u + (X * ((color2.u - color1.u) / breaks)),
		color1.v + (X * ((color2.v - color1.v) / breaks))).rgb();
	return '"' + rgbToHex(t.r,t.g,t.b) + '",';
}

function getLessHSL(X) {
	var t = d3.hsl(color3.h + (X * ((color4.h - color3.h) / breaks)),
		color3.s + (X * ((color4.s - color3.s) / breaks)),
		color3.l + (X * ((color4.l - color3.l) / breaks))).rgb();
	return '"' + rgbToHex(t.r,t.g,t.b) + '",';
}

function getLessLAB(X) {
	var t = d3.lab(color5.l + (X * ((color6.l - color5.l) / breaks)),
		color5.a + (X * ((color6.a - color5.a) / breaks)),
		color5.b + (X * ((color6.b - color5.b) / breaks))).rgb();
	return '"' + rgbToHex(t.r,t.g,t.b) + '",';
}

for (var i = 0; i < breaks + 1 ; i++) {
	console.log(getLess(i));
}

console.log(' ');

for (var i = 0; i < breaks + 1 ; i++) {
	console.log(getLessHSL(i));
}

console.log(' ');

for (var i = 0; i < breaks + 1 ; i++) {
	console.log(getLessLAB(i));
}
//
