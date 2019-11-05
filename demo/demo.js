function adapt() {
  var br = document.getElementById('sliderBrightness');
  var con = document.getElementById('sliderContrast');
  var mode = document.getElementById('darkMode');

  var brVal = br.value;
  var conVal = con.value;

  // console.log(conVal);

  if(mode.checked == true) {
    var base = '#15141D';
    brVal = brVal * 1.5;
  } else {
    var base = '#d1d1d7';
    brVal = brVal * 0.5;
  }

  base = d3.rgb(base).brighter(brVal);

  var grayRatios = [1,1.25,1.94,3,3.99,5.22,6.96,9.30,12.45,15];
  var redRatios = [1.3,3.5,5];
  var blueRatios = [1.3,3,4.5];

  grayRatios = grayRatios.map(function(d) {
    var newVal = ((d-1) * conVal) + 1;
    return newVal;
  });
  // console.log(grayRatios);

  // adaptColor();
  grayArray = adaptcolor({ color: "#707080", base: base, ratios: grayRatios, tint: "#cacad0", shade: "#333351", colorspace: "LAB"});
  redArray = adaptcolor({ color: "#cb1404", base: base, ratios: redRatios, tint: "#ffbbb9", shade: "#b10000", colorspace: "LAB"});
  blueArray = adaptcolor({ color: "#2a77a7", base: base, ratios: blueRatios, tint: "#71b4ca", shade: "#331f4f", colorspace: "CAM02"});

  document.documentElement.style
    .setProperty('--gray100', grayArray[0]);
  document.documentElement.style
    .setProperty('--gray200', grayArray[1]);
  document.documentElement.style
    .setProperty('--gray300', grayArray[2]);
  document.documentElement.style
    .setProperty('--gray400', grayArray[3]);
  document.documentElement.style
    .setProperty('--gray500', grayArray[4]);
  document.documentElement.style
    .setProperty('--gray600', grayArray[5]);
  document.documentElement.style
    .setProperty('--gray700', grayArray[6]);
  document.documentElement.style
    .setProperty('--gray800', grayArray[7]);
  document.documentElement.style
    .setProperty('--gray900', grayArray[8]);
  document.documentElement.style
    .setProperty('--gray1000', grayArray[9]);
  document.documentElement.style
    .setProperty('--gray1100', grayArray[10]);


}
adapt();
