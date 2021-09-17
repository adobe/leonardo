import {_theme} from './initialTheme';

function createSVGuiKit() {
  let colors = _theme.contrastColors;

  const rectSize = 80;
  const marginX = rectSize + 16 ;
  const offsetX = 166;
  const marginY = rectSize + 60;
  const svgWrapper = document.getElementById( 'svgOne' );
  const swatchesPerColor = 14;
  const numberOfColors = colors.length - 1;
  const maxSvgWidth = (marginX * swatchesPerColor) + offsetX;
  const maxSvgHeight = marginY * numberOfColors;
  let textColorPositive = (isDark) ? '#fff' : '#000';
  let textColorInverse = (isDark) ? '#000' : '#fff';
  
  svgWrapper.style.width = maxSvgWidth + 'px';
  svgWrapper.style.height = maxSvgHeight + 'px';
  svgWrapper.style.backgroundColor = colors[0].background;
  
  var svgns = "http://www.w3.org/2000/svg";
  
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  for(let i=0; i < colors.length; i++) {
    if(!colors[i].name) {
      // skip it, it's the background
    } else {
      let name = colors[i].name;  
      let tokenColorName = `${name}-`;
      let values = colors[i].values;
      let increment = i - 0.85;
      let y = marginY * increment;
      console.log(name)
      var title = document.createElementNS( svgns,'text' );
      var descriptor = document.createElementNS( svgns,'text' );
  
      title.setAttribute('x', 0);
      title.setAttribute('y', y + 13);
      title.setAttribute('fill', textColorPositive);
      title.setAttribute('font-size', 18);
      title.setAttribute('font-weight', 700);
      title.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
      title.textContent = capitalizeFirstLetter(name);
  
      descriptor.setAttribute('x', 0);
      descriptor.setAttribute('y', y + 70);
      descriptor.setAttribute('fill', textColorPositive);
      descriptor.setAttribute('font-size', 11);
      descriptor.setAttribute('letter-spacing', 0.6);
      descriptor.setAttribute('font-weight', 'bold');
      descriptor.setAttribute('font-family', "Adobe Clean, AdobeClean-Regular, Adobe Clean");
      descriptor.textContent = `CONTRAST WITH BACKGROUND`
      
      svgWrapper.appendChild( title );
      svgWrapper.appendChild( descriptor );
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
        text.textContent = values[j].contrast;
        
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
}

module.exports = {
  createSVGuiKit
}