import * as Leo from '@adobe/leonardo-contrast-colors';
import d3 from './d3'
import {_theme} from './initialTheme';
import {cvdColors} from './cvdColors';
import {round} from './utils';

function createOutputColors() {
  let colorClasses = _theme.colors;
  
  let swatchesOutputs = document.getElementById('swatchesOutputs')
  let themeOutputs = document.getElementById('themeOutputs');
  swatchesOutputs.innerHTML = ' ';
  themeOutputs.innerHTML = ' ';

  let theme = _theme.contrastColors;
  let themeBackgroundColor = theme[0].background;
  let themeBackgroundColorArray = [d3.rgb(themeBackgroundColor).r, d3.rgb(themeBackgroundColor).g, d3.rgb(themeBackgroundColor).b]
  const backgroundLum = _theme.lightness;

  let themeColorArray = [];

  themeOutputs.style.backgroundColor = themeBackgroundColor;
  let destinations = [ themeOutputs, swatchesOutputs ]
  // Iterate each color from theme except 1st object (background)
  destinations.map((dest) => {
    for (let i=0; i<theme.length; i++) {
      let wrapper = document.createElement('div');
      wrapper.className = 'themeOutputItem';

      let swatchWrapper = document.createElement('div');
      swatchWrapper.className = 'themeOutputColor';
      let colorName = theme[i].name;

      // Iterate each color value
      if (theme[i].values) {
        let p = document.createElement('p');
        p.className = 'spectrum-Heading spectrum-Heading--sizeXXS themeOutputItem--Heading';
        p.style.color = (backgroundLum > 50) ? '#000000' : '#ffffff';
        p.innerHTML = theme[i].name;

        if(dest === themeOutputs) {
          wrapper.appendChild(p);
        }

        for(let j=0; j<theme[i].values.length; j++) { // for each value object
          let originalValue = theme[i].values[j].value; // output value of color
          let swatchName = theme[i].values[j].name.replace(colorName, '');
          
          // transform original color based on preview mode
          let value = cvdColors(originalValue);

          // get the ratio to print inside the swatch
          let contrast = theme[i].values[j].contrast;
          let colorArray = [d3.rgb(originalValue).r, d3.rgb(originalValue).g, d3.rgb(originalValue).b]
          let actualContrast = Leo.contrast(colorArray, themeBackgroundColorArray);

          let innerTextColor =  (d3.hsluv(originalValue).v > 50) ? '#000000' : '#ffffff';
          let contrastRounded = (Math.round(actualContrast * 100))/100;
          let contrastText = document.createTextNode(contrastRounded + ' :1');
          let contrastTextSpan = document.createElement('span');
          contrastTextSpan.className = 'themeOutputSwatch_contrast';
          contrastTextSpan.appendChild(contrastText);
          contrastTextSpan.style.color = innerTextColor;

          let luminosityValue = round(d3.hsluv(originalValue).v, 2);
          let luminosityText = document.createTextNode(luminosityValue + '%');
          let luminosityTextSpan = document.createElement('span');
          luminosityTextSpan.className = 'themeOutputSwatch_luminosity';
          luminosityTextSpan.appendChild(luminosityText);
          luminosityTextSpan.style.color = innerTextColor;

          let swatchIndexText = document.createTextNode(swatchName);
          let swatchIndexTextSpan = document.createElement('span');
          swatchIndexTextSpan.className = 'themeOutputSwatch_index';
          swatchIndexTextSpan.appendChild(swatchIndexText);
          swatchIndexTextSpan.style.color = innerTextColor;

          let div = document.createElement('div');
          div.className = 'themeOutputSwatch';
          // copy text should be for value of original color, not of preview color.
          div.setAttribute('data-clipboard-text', originalValue);
          div.setAttribute('tabindex', '0');
          div.style.backgroundColor = value;
          div.style.borderColor = (backgroundLum > 50 && contrast < 3) ?  'rgba(0, 0, 0, 0.2)' : ((backgroundLum <= 50 && contrast < 3) ? ' rgba(255, 255, 255, 0.4)' : 'transparent');
          
          if(dest === themeOutputs) {
            div.appendChild(swatchIndexTextSpan);
          } else {
            div.appendChild(luminosityTextSpan);
          }

          div.appendChild(contrastTextSpan);  

          swatchWrapper.appendChild(div);
          themeColorArray.push(originalValue);
        }
        wrapper.appendChild(swatchWrapper);
      }
      else if (theme[i].background && dest === themeOutputs) {
        let p = document.createElement('p');
        p.className = 'spectrum-Heading spectrum-Heading--sizeXXS  themeOutputItem--Heading';
        p.innerHTML = 'Background color';
        p.style.color = (backgroundLum > 50) ? '#000000' : '#ffffff';

        wrapper.appendChild(p);

        let originalValue = theme[i].background; // output value of color
        // set global variable value. Probably shouldn't do it this way.
        let currentBackgroundColor = originalValue;
        let value = cvdColors(originalValue);

        let div = document.createElement('div');
        div.className = 'themeOutputSwatch';
        div.setAttribute('tabindex', '0');
        div.setAttribute('data-clipboard-text', originalValue);
        div.style.backgroundColor = value;
        div.style.borderColor = (backgroundLum > 50) ?  'rgba(0, 0, 0, 0.2)' : ((backgroundLum <= 50) ? ' rgba(255, 255, 255, 0.4)' : 'transparent');

        swatchWrapper.appendChild(div);
        wrapper.appendChild(swatchWrapper);

        themeColorArray.push(originalValue);
      }

      dest.appendChild(wrapper);
    }
  })

  let copyThemeColors = document.getElementById('copyThemeColors');
  copyThemeColors.setAttribute('data-clipboard-text', themeColorArray);
}

module.exports = {
  createOutputColors
}