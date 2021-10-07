import { saveAs } from 'file-saver';
import d3 from './d3';
import {
  _theme,
  _themeTypography
} from './initialTheme';
import {getThemeName} from './getThemeData';
import { createSvgElement } from './createHtmlElement';

function createSVGuiKit() {
  let colors = _theme.contrastColors;
  let bgLum = d3.hsluv(colors[0].background).v;  
  let isDark = (bgLum > 50) ? false : true;
  var svgns = "http://www.w3.org/2000/svg";

  const rectSize = 80;
  const marginX = rectSize + 16 ;
  const offsetX = 166;
  const marginY = rectSize + 57;
  let typographyYstart;

  const swatchesPerColor = colors[1].values.length;
  const numberOfColors = colors.length - 1;
  const maxColorWidth = (marginX * swatchesPerColor) + offsetX;
  const maxTypeWidth = (marginX * _themeTypography.sizes.length) + offsetX;
  const maxSvgWidth = (maxColorWidth > maxTypeWidth) ? maxColorWidth: maxTypeWidth;
  const maxColorsHeight = marginY * numberOfColors;
  const numberOfTypes = _themeTypography.weights.length;
  const maxTypeSize = Math.max(..._themeTypography.sizes);
  const maxTypographyHeight = maxTypeSize * numberOfTypes;
  const maxSvgHeight = maxColorsHeight + maxTypographyHeight;
  let textColorPositive = (isDark) ? '#fff' : '#000';
  let textColorInverse = (isDark) ? '#000' : '#fff';
  
  let svgWrapper = document.createElementNS(svgns, 'svg');
  svgWrapper.setAttribute("xmlns", svgns);
  svgWrapper.setAttribute("version", "1.1");
  svgWrapper.setAttributeNS( null, 'width', maxSvgWidth + 'px' );
  svgWrapper.setAttributeNS( null, 'height', maxSvgHeight + 'px' );
  // svgWrapper.setAttributeNS( null, 'fill', colors[0].background );
  // svgWrapper.style.backgroundColor = colors[0].background;
  svgWrapper.setAttribute("aria-hidden", "true");

  let background = document.createElementNS(svgns, 'rect');
  background.setAttribute('fill', colors[0].background);
  background.setAttribute('width', maxSvgWidth + 'px')
  background.setAttribute('height', maxSvgHeight + 'px')

  svgWrapper.appendChild(background);

  let outerElement = document.createElement('div');
  outerElement.id = 'UIkit';

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  for(let i=0; i < colors.length; i++) {
    if(!colors[i].name) {
      // skip it, it's the background
    } else {
      let name = colors[i].name;  
      let tokenColorName = `${name}`;
      let values = colors[i].values;
      let increment = i - 0.75;
      let y = marginY * increment;
      typographyYstart = y + rectSize;

      var title = document.createElementNS( svgns,'text' );
      var descriptor = document.createElementNS( svgns,'text' );
      var descriptor2 = document.createElementNS( svgns,'text' );
  
      title.setAttribute('x', 16);
      title.setAttribute('y', y + 13);
      title.setAttribute('fill', textColorPositive);
      title.setAttribute('font-size', 18);
      title.setAttribute('font-weight', 700);
      title.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
      title.textContent = capitalizeFirstLetter(name);
  
      descriptor.setAttribute('x', 16);
      descriptor.setAttribute('y', y + 60);
      descriptor.setAttribute('fill', textColorPositive);
      descriptor.setAttribute('font-size', 11);
      descriptor.setAttribute('letter-spacing', 0.6);
      descriptor.setAttribute('font-weight', 'bold');
      descriptor.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
      descriptor.textContent = `Contrast with`

      descriptor2.setAttribute('x', 16);
      descriptor2.setAttribute('y', y + 72);
      descriptor2.setAttribute('fill', textColorPositive);
      descriptor2.setAttribute('font-size', 11);
      descriptor2.setAttribute('letter-spacing', 0.6);
      descriptor2.setAttribute('font-weight', 'bold');
      descriptor2.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
      descriptor2.textContent = `background color`
      
      svgWrapper.appendChild( title );
      svgWrapper.appendChild( descriptor );
      svgWrapper.appendChild( descriptor2 );
      // loop each value to create a swatch
      for(let j=0; j < values.length; j++) {
        var rect = document.createElementNS( svgns,'rect' );
        var text = document.createElementNS( svgns,'text' );
        var subHead = document.createElementNS( svgns,'text' );
  
        let x = marginX * j + offsetX;
        let textX = x + 8;
        let textY = y + rectSize - 8;
        let textColor = (values[j].contrast > 4.5) ? textColorInverse : textColorPositive;
        
        rect.setAttributeNS( null,'x',x );
        rect.setAttributeNS( null,'y',y );
        rect.setAttributeNS( null,'width','80' );
        rect.setAttributeNS( null,'height','80' );
        rect.setAttributeNS( null,'rx','8' );
        rect.setAttributeNS( null,'fill', values[j].value );
        
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', 12);
        text.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
        text.textContent = `${values[j].contrast}:1`;
        
        subHead.setAttribute('x', x);
        subHead.setAttribute('y', y - 11);
        subHead.setAttribute('fill', textColorPositive);
        subHead.setAttribute('font-size', 14);
        subHead.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
        subHead.textContent = values[j].name.replace(tokenColorName, '');
        
        svgWrapper.appendChild( rect );
        svgWrapper.appendChild( text );
        svgWrapper.appendChild( subHead );
      }
    }
  }

  /**
   * Create typography elements
   */

  for(let i=0; i < _themeTypography.weights.length; i++) {
    let name = 'Typography';  
    // let increment = i - 0.75 + typographyYstart;
    // let y = marginY * increment;
    let typeYoffset = 0;
    let y = typographyYstart * (i + 1) + maxTypeSize + typeYoffset;

    var title = document.createElementNS( svgns,'text' );

    title.setAttribute('x', 16);
    title.setAttribute('y', y - 8);
    title.setAttribute('fill', textColorPositive);
    title.setAttribute('font-size', 18);
    title.setAttribute('font-weight', 700);
    title.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
    title.textContent = capitalizeFirstLetter(name);
    
    svgWrapper.appendChild( title );
    console.log(_themeTypography.sizes)
    // loop each value to create a swatch
    let typeSizeOffset = 0;
    for(let j=0; j < _themeTypography.sizes.length; j++) {
      var text = document.createElementNS( svgns,'text' );
      if(j > 0) typeSizeOffset = typeSizeOffset + (_themeTypography.sizes[j] * 1.65);
      let x = typeSizeOffset + (offsetX - 8);
      let textX = x + 8;
      let textY = y;
      let textColor = textColorPositive;
      
      text.setAttribute('x', textX);
      text.setAttribute('y', textY);
      text.setAttribute('fill', textColor);
      text.setAttribute('font-size', `${_themeTypography.sizes[j]}`);
      text.setAttribute('font-weight', `${_themeTypography.weights[i]}`)
      text.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
      text.textContent = `Ag`;

      svgWrapper.appendChild( text );
    }
  }

  /** 
  * End of typography
  */
  outerElement.appendChild(svgWrapper);
  document.body.appendChild(outerElement);
}

function downloadUiKit() {
  createSVGuiKit();
  let themeName = getThemeName();
  let svg = document.getElementById('UIkit').innerHTML;

  let filename = `${themeName}.svg`;
  var blob = new Blob([`${svg}`], {type: "image/svg+xml;charset=utf-8"});

  saveAs(blob, filename);

  document.getElementById('UIkit').remove();
}

window.downloadUiKit = downloadUiKit;

document.getElementById('downloadThemeColorsSvg').addEventListener('click', () => {
  setTimeout(function() {
    downloadUiKit()
  }),
  1000
})

module.exports = {
  createSVGuiKit,
  downloadUiKit
}