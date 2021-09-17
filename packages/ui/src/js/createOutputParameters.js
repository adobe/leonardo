import {_theme} from './initialTheme';
import {
  getAllColorNames,
  getThemeName
} from './getThemeData';
import {camelCase} from './utils';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';;
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);

function createOutputParameters() {
  createJSOutput();
  createCSSOutput();
  createTokensOutput();
}

function createJSOutput() {
  let paramsOutput = document.getElementById('themeJSParams');

  let themeName = getThemeName();
  if(!themeName) themeName = 'myTheme';
  let colors = _theme.colors;
  let colorNames = getAllColorNames();
  let colorDeclarations = [];

  for(let i = 0; i < colors.length; i++) {
    let thisColor = colors[i];
    let colorString = 
`let ${camelCase(thisColor.name)} = new Leo.Color({
  name: "${thisColor.name}",
  colorKeys: [${thisColor.colorKeys.map((c) => `'${c}'`)}],
  ratios: [${thisColor.ratios}],
  colorspace: {${thisColor.colorspace}},
  smooth: ${thisColor.smooth}
});`;
    colorDeclarations.push(colorString);
  }
  const joinedDeclarations = colorDeclarations.join(`\n\n`);

  let paramOutputString = 
`${joinedDeclarations}

let ${themeName.replace(/\s/g, '')} = new Leo.Theme({
  colors: [${colorNames.map((n) => camelCase(n))}],
  backgroundColor: ${camelCase(_theme.backgroundColor.name)},
  lightness: ${_theme.lightness},
  contrast: ${_theme.contrast},
  saturation: ${_theme.saturation}
});`;

  const highlightedCode = hljs.highlight(paramOutputString, {language: 'javascript'}).value
  paramsOutput.innerHTML = highlightedCode;
}

function createCSSOutput() {
  let themeName = getThemeName();
  let themeCssClass = `.${themeName.replace(/\s/g, '')}`
  if(!themeName) themeCssClass = ':root';
  
  let paramsOutput = document.getElementById('themeCSSParams');

  let contrastPairs = _theme.contrastColorPairs;
  let declarations = [];
  for (const [key, value] of Object.entries(contrastPairs)) {
    declarations.push(`  --${key}: ${value};`);
  }
  const joinedDeclarations = declarations.join(`\n`);
  let paramOutputString =
`${themeCssClass} {
${joinedDeclarations}
}`;

  const highlightedCode = hljs.highlight(paramOutputString, {language: 'css'}).value
  paramsOutput.innerHTML = highlightedCode;
}

function createTokensOutput() {
  let paramsOutput = document.getElementById('themeJSParams');

}

module.exports = {
  createOutputParameters
}