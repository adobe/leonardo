/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Theme, Color, BackgroundColor } = require('../index.js');
// import { Theme, Color, BackgroundColor } from  '..index.js';

test('should generate theme for three colors', function() {
  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12]});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12]});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 90}); 
  let themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { "background": "#e1e1e1" },
    {
      "name": 'gray',
      "values": [
        {"name": "gray100", "contrast": 1, "value": "#e0e0e0"},
        {"name": "gray200", "contrast": 1.2, "value": "#cecece"},
        {"name": "gray300", "contrast": 1.4, "value": "#bfbfbf"},
        {"name": "gray400", "contrast": 2, "value": "#a0a0a0"},
        {"name": "gray500", "contrast": 3, "value": "#808080"},
        {"name": "gray600", "contrast": 4.5, "value": "#646464"},
        {"name": "gray700", "contrast": 6, "value": "#525252"},
        {"name": "gray800", "contrast": 8, "value": "#404040"},
        {"name": "gray900", "contrast": 12, "value": "#232323"},
        {"name": "gray1000", "contrast": 21, "value": "#000000"}
      ]
    },
    {
      "name": 'blue',
      "values": [
        {"name": "blue100", "contrast": 2, "value": "#b18cff"},
        {"name": "blue200", "contrast": 3, "value": "#8d63ff"},
        {"name": "blue300", "contrast": 4.5, "value": "#623aff"},
        {"name": "blue400", "contrast": 8, "value": "#1c0ad1"},
        {"name": "blue500", "contrast": 12, "value": "#211068"}
      ]
    },
    {
      "name": 'red',
      "values": [
        {"name": "red100", "contrast": 2, "value": "#ff7474"},
        {"name": "red200", "contrast": 3, "value": "#ff1313"},
        {"name": "red300", "contrast": 4.5, "value": "#cc0000"},
        {"name": "red400", "contrast": 8, "value": "#860000"},
        {"name": "red500", "contrast": 12, "value": "#500000"}
      ]
    }
  ]);

});

test('should generate theme for three colors in LCH format', function() {
  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12]});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12]});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 90, output: 'LCH'}); 
  let themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { "background": "#e1e1e1" },
    {
      "name": 'gray',
      "values": [
        {"name": "gray100", "contrast": 1, "value": "lch(89%, 0, 0deg)"},
        {"name": "gray200", "contrast": 1.2, "value": "lch(83%, 0, 0deg)"},
        {"name": "gray300", "contrast": 1.4, "value": "lch(77%, 0, 0deg)"},
        {"name": "gray400", "contrast": 2, "value": "lch(66%, 0, 0deg)"},
        {"name": "gray500", "contrast": 3, "value": "lch(54%, 0, 0deg)"},
        {"name": "gray600", "contrast": 4.5, "value": "lch(42%, 0, 0deg)"},
        {"name": "gray700", "contrast": 6, "value": "lch(35%, 0, 0deg)"},
        {"name": "gray800", "contrast": 8, "value": "lch(27%, 0, 0deg)"},
        {"name": "gray900", "contrast": 12, "value": "lch(14%, 0, 0deg)"},
        {"name": "gray1000", "contrast": 21, "value": "lch(0%, 0, 0deg)"}
      ]
    },
    {
      "name": 'blue',
      "values": [
        {"name": "blue100", "contrast": 2, "value": "lch(65%, 62, 302deg)"},
        {"name": "blue200", "contrast": 3, "value": "lch(53%, 86, 301deg)"},
        {"name": "blue300", "contrast": 4.5, "value": "lch(41%, 109, 301deg)"},
        {"name": "blue400", "contrast": 8, "value": "lch(25%, 110, 301deg)"},
        {"name": "blue500", "contrast": 12, "value": "lch(13%, 57, 301deg)"}
      ]
    },
    {
      "name": 'red',
      "values": [
        {"name": "red100", "contrast": 2, "value": "lch(66%, 61, 27deg)"},
        {"name": "red200", "contrast": 3, "value": "lch(55%, 103, 39deg)"},
        {"name": "red300", "contrast": 4.5, "value": "lch(43%, 90, 41deg)"},
        {"name": "red400", "contrast": 8, "value": "lch(28%, 65, 39deg)"},
        {"name": "red500", "contrast": 12, "value": "lch(14%, 42, 33deg)"}
      ]
    }
  ]);

});

test('should generate theme for three colors with negative ratios', function() {
  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12]});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12]});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 90}); 
  let themeColors = theme.contrastColors;

    expect(themeColors).toEqual([
        { "background": "#e1e1e1" },
        {
          "name": "gray",
          "values": [
            {"name": "gray33", "contrast": -1.8, "value": "#ffffff"},
            {"name": "gray67", "contrast": -1.2, "value": "#f5f5f5"},
            {"name": "gray100", "contrast": 1, "value": "#e0e0e0"},
            {"name": "gray200", "contrast": 1.2, "value": "#cecece"},
            {"name": "gray300", "contrast": 1.4, "value": "#bfbfbf"},
            {"name": "gray400", "contrast": 2, "value": "#a0a0a0"},
            {"name": "gray500", "contrast": 3, "value": "#808080"},
            {"name": "gray600", "contrast": 4.5, "value": "#646464"},
            {"name": "gray700", "contrast": 6, "value": "#525252"},
            {"name": "gray800", "contrast": 8, "value": "#404040"},
            {"name": "gray900", "contrast": 12, "value": "#232323"},
            {"name": "gray1000", "contrast": 21, "value": "#000000"}
          ]
        },
        {
          "name": "blue",
          "values": [
            {"name": "blue100", "contrast": 2, "value": "#b18cff"},
            {"name": "blue200", "contrast": 3, "value": "#8d63ff"},
            {"name": "blue300", "contrast": 4.5, "value": "#623aff"},
            {"name": "blue400", "contrast": 8, "value": "#1c0ad1"},
            {"name": "blue500", "contrast": 12, "value": "#211068"}
          ]
        },
        {
          "name": "red",
          "values": [
            {"name": "red100", "contrast": 2, "value": "#ff7474"},
            {"name": "red200", "contrast": 3, "value": "#ff1313"},
            {"name": "red300", "contrast": 4.5, "value": "#cc0000"},
            {"name": "red400", "contrast": 8, "value": "#860000"},
            {"name": "red500", "contrast": 12, "value": "#500000"}
          ]
        }
      ]);
});

test('should generate theme for three colors using variables as parameters', function() {
  let tempRatios = [2, 3, 4.5, 8, 12];
  let baseRatios = [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21];

  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: baseRatios});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: tempRatios});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: tempRatios});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 90}); 
  let themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { "background": "#e1e1e1" },
    {
      "name": 'gray',
      "values": [
        {"name": "gray100", "contrast": 1, "value": "#e0e0e0"},
        {"name": "gray200", "contrast": 1.2, "value": "#cecece"},
        {"name": "gray300", "contrast": 1.4, "value": "#bfbfbf"},
        {"name": "gray400", "contrast": 2, "value": "#a0a0a0"},
        {"name": "gray500", "contrast": 3, "value": "#808080"},
        {"name": "gray600", "contrast": 4.5, "value": "#646464"},
        {"name": "gray700", "contrast": 6, "value": "#525252"},
        {"name": "gray800", "contrast": 8, "value": "#404040"},
        {"name": "gray900", "contrast": 12, "value": "#232323"},
        {"name": "gray1000", "contrast": 21, "value": "#000000"}
      ]
    },
    {
      "name": 'blue',
      "values": [
        {"name": "blue100", "contrast": 2, "value": "#b18cff"},
        {"name": "blue200", "contrast": 3, "value": "#8d63ff"},
        {"name": "blue300", "contrast": 4.5, "value": "#623aff"},
        {"name": "blue400", "contrast": 8, "value": "#1c0ad1"},
        {"name": "blue500", "contrast": 12, "value": "#211068"}
      ]
    },
    {
      "name": 'red',
      "values": [
        {"name": "red100", "contrast": 2, "value": "#ff7474"},
        {"name": "red200", "contrast": 3, "value": "#ff1313"},
        {"name": "red300", "contrast": 4.5, "value": "#cc0000"},
        {"name": "red400", "contrast": 8, "value": "#860000"},
        {"name": "red500", "contrast": 12, "value": "#500000"}
      ]
    }
  ]);

});

test('should generate theme with increased contrast', function() {
  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca', '#323232'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12]});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12]});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 90, contrast: 1.4}); 
  let themeColors = theme.contrastColors;

    expect(themeColors).toEqual([
      { "background": "#e1e1e1" },
      {
        "name": 'gray',
        "values": [
          {"name": "gray33", "contrast": -2.12, "value": "#ffffff"},
          {"name": "gray67", "contrast": -1.28, "value": "#fdfdfd"},
          {"name": "gray100", "contrast": 1, "value": "#e0e0e0"},
          {"name": "gray200", "contrast": 1.28, "value": "#c8c8c8"},
          {"name": "gray300", "contrast": 1.56, "value": "#b6b6b6"},
          {"name": "gray400", "contrast": 2.4, "value": "#919191"},
          {"name": "gray500", "contrast": 3.8, "value": "#707070"},
          {"name": "gray600", "contrast": 5.9, "value": "#525252"},
          {"name": "gray700", "contrast": 8, "value": "#404040"},
          {"name": "gray800", "contrast": 10.8, "value": "#2b2b2b"},
          {"name": "gray900", "contrast": 16.4, "value": "#000000"},
          {"name": "gray1000", "contrast": 29, "value": "#000000"}
        ]
      },
      {
        "name": 'blue',
        "values": [
          {"name": "blue100", "contrast": 2.4, "value": "#a179ff"},
          {"name": "blue200", "contrast": 3.8, "value": "#764bff"},
          {"name": "blue300", "contrast": 5.9, "value": "#3418ff"},
          {"name": "blue400", "contrast": 10.8, "value": "#231086"},
          {"name": "blue500", "contrast": 16.4, "value": "#000000"}
        ]
      },
      {
        "name": 'red',
        "values": [
          {"name": "red100", "contrast": 2.4, "value": "#ff5555"},
          {"name": "red200", "contrast": 3.8, "value": "#e10000"},
          {"name": "red300", "contrast": 5.9, "value": "#aa0000"},
          {"name": "red400", "contrast": 10.8, "value": "#5f0000"},
          {"name": "red500", "contrast": 16.4, "value": "#000000"}
        ]
      }
    ]);

});

test('should generate white theme with increased contrast', function() {
  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12]});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12]});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 100, contrast: 2}); 
  let themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { "background": "#fefefe" },
    {
      name: 'gray',
      values: [
        {"name": "gray33", "contrast": -2.6, "value": "#ffffff"},
        {"name": "gray67", "contrast": -1.4, "value": "#ffffff"},
        {"name": "gray100", "contrast": 1, "value": "#fefefe"},
        {"name": "gray200", "contrast": 1.4, "value": "#d9d9d9"},
        {"name": "gray300", "contrast": 1.8, "value": "#c0c0c0"},
        {"name": "gray400", "contrast": 3, "value": "#949494"},
        {"name": "gray500", "contrast": 5, "value": "#6f6f6f"},
        {"name": "gray600", "contrast": 8, "value": "#505050"},
        {"name": "gray700", "contrast": 11, "value": "#3b3b3b"},
        {"name": "gray800", "contrast": 15, "value": "#272727"},
        {"name": "gray900", "contrast": 23, "value": "#000000"},
        {"name": "gray1000", "contrast": 41, "value": "#000000"}
      ]
    },
    {
      name: 'blue',
      values: [
        {"name": "blue100", "contrast": 3, "value": "#a47cff"},
        {"name": "blue200", "contrast": 5, "value": "#744aff"},
        {"name": "blue300", "contrast": 8, "value": "#2610ff"},
        {"name": "blue400", "contrast": 15, "value": "#221073"},
        {"name": "blue500", "contrast": 23, "value": "#000000"}
      ]
    },
    {
      name: 'red',
      values: [
        {"name": "red100", "contrast": 3, "value": "#ff5c5c"},
        {"name": "red200", "contrast": 5, "value": "#e00000"},
        {"name": "red300", "contrast": 8, "value": "#a60000"},
        {"name": "red400", "contrast": 15, "value": "#560000"},
        {"name": "red500", "contrast": 23, "value": "#000000"}
      ]
    }
  ]);

});

test('should generate dark theme with increased contrast', function() {
  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21]});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: [2, 3, 4.5, 8, 12]});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: [2, 3, 4.5, 8, 12]});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1.5}); 
  let themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { "background": "#303030" },
    {
      name: 'gray',
      values: [
        {"name": "gray33", "contrast": -2.2, "value": "#000000"},
        {"name": "gray67", "contrast": -1.3, "value": "#1c1c1c"},
        {"name": "gray100", "contrast": 1, "value": "#303030"},
        {"name": "gray200", "contrast": 1.3, "value": "#414141"},
        {"name": "gray300", "contrast": 1.6, "value": "#4f4f4f"},
        {"name": "gray400", "contrast": 2.5, "value": "#6b6b6b"},
        {"name": "gray500", "contrast": 4, "value": "#8e8e8e"},
        {"name": "gray600", "contrast": 6.25, "value": "#b3b3b3"},
        {"name": "gray700", "contrast": 8.5, "value": "#d0d0d0"},
        {"name": "gray800", "contrast": 11.5, "value": "#efefef"},
        {"name": "gray900", "contrast": 17.5, "value": "#ffffff"},
        {"name": "gray1000", "contrast": 31, "value": "#ffffff"}
      ]
    },
    {
      name: 'blue',
      values: [
        {"name": "blue100", "contrast": 2.5, "value": "#6f45ff"},
        {"name": "blue200", "contrast": 4, "value": "#9d73ff"},
        {"name": "blue300", "contrast": 6.25, "value": "#c3a3ff"},
        {"name": "blue400", "contrast": 11.5, "value": "#f4edff"},
        {"name": "blue500", "contrast": 17.5, "value": "#ffffff"}
      ]
    },
    {
      name: 'red',
      values: [
        {"name": "red100", "contrast": 2.5, "value": "#da0000"},
        {"name": "red200", "contrast": 4, "value": "#ff4b4b"},
        {"name": "red300", "contrast": 6.25, "value": "#ff9494"},
        {"name": "red400", "contrast": 11.5, "value": "#ffebeb"},
        {"name": "red500", "contrast": 17.5, "value": "#ffffff"}
      ]
    }
  ]);
});


test('should generate colors with user-defined names', function() {
  let grayRatios = {
    'GRAY_1': -1.8,
    'GRAY_2': -1.2,
    'GRAY_3': 1,
    'GRAY_4': 1.2,
    'GRAY_5': 1.4,
    'GRAY_6': 2,
    'GRAY_7': 3,
    'GRAY_8': 4.5,
    'GRAY_9': 21
  };
  let blueRatios = {
    'BLUE_LARGE_TEXT': 3,
    'BLUE_TEXT': 4.5,
    'BLUE_HIGH_CONTRAST': 8,
    'BLUE_HIGHEST_CONTRAST': 12
  };
  let redRatios = {
    'red--largeText': 3,
    'red--text': 4.5,
    'red--highContrast': 8,
    'red--highestContrast': 12
  };

  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: grayRatios});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: blueRatios});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: redRatios});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1}); 
  let themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { "background": "#303030" },
    {
      "name": 'gray',
      "values": [
        {"name": "GRAY_1", "contrast": -1.8, "value": "#000000"},
        {"name": "GRAY_2", "contrast": -1.2, "value": "#222222"},
        {"name": "GRAY_3", "contrast": 1, "value": "#303030"},
        {"name": "GRAY_4", "contrast": 1.2, "value": "#3c3c3c"},
        {"name": "GRAY_5", "contrast": 1.4, "value": "#464646"},
        {"name": "GRAY_6", "contrast": 2, "value": "#5d5d5d"},
        {"name": "GRAY_7", "contrast": 3, "value": "#797979"},
        {"name": "GRAY_8", "contrast": 4.5, "value": "#969696"},
        {"name": "GRAY_9", "contrast": 21, "value": "#ffffff"}
      ]
    },
    {
      "name": 'blue',
      "values": [
        {"name": "BLUE_LARGE_TEXT", "contrast": 3, "value": "#8258ff"},
        {"name": "BLUE_TEXT", "contrast": 4.5, "value": "#a780ff"},
        {"name": "BLUE_HIGH_CONTRAST", "contrast": 8, "value": "#d6bfff"},
        {"name": "BLUE_HIGHEST_CONTRAST", "contrast": 12, "value": "#f7f2ff"}
      ]
    },
    {
      "name": 'red',
      "values": [
        {"name": "red--largeText", "contrast": 3, "value": "#f20000"},
        {"name": "red--text", "contrast": 4.5, "value": "#ff6161"},
        {"name": "red--highContrast", "contrast": 8, "value": "#ffb8b8"},
        {"name": "red--highestContrast", "contrast": 12, "value": "#fff1f1"}
      ]
    }
  ]);
});


test('should generate colors with user-defined names and increased contrast', function() {
  let grayRatios = {
    'GRAY_1': -2,
    'GRAY_2': -1.2,
    'GRAY_3': 1,
    'GRAY_4': 1.2,
    'GRAY_5': 1.4,
    'GRAY_6': 2,
    'GRAY_7': 3,
    'GRAY_8': 4.5,
    'GRAY_9': 21
  };
  let blueRatios = {
    'BLUE_LARGE_TEXT': 3,
    'BLUE_TEXT': 4.5,
    'BLUE_HIGH_CONTRAST': 8,
    'BLUE_HIGHEST_CONTRAST': 12
  };
  let redRatios = {
    'red--largeText': 3,
    'red--text': 4.5,
    'red--highContrast': 8,
    'red--highestContrast': 12
  };

  let gray = new BackgroundColor({"name": 'gray', colorKeys: ['#cacaca'], colorspace: 'HSL', ratios: grayRatios});
  let blue = new Color({"name": 'blue', colorKeys: ['#0000ff'], colorspace: 'LAB', ratios: blueRatios});
  let red = new Color({"name": 'red', colorKeys: ['#ff0000'], colorspace: 'RGB', ratios: redRatios});
  let theme = new Theme({colors: [gray, blue, red], backgroundColor: gray, lightness: 20, contrast: 1.2}); 
  let themeColors = theme.contrastColors;

  expect(themeColors).toEqual([
    { "background": "#303030" },
    {
      "name": 'gray',
      "values": [
        {"name": "GRAY_1", "contrast": -2.2, "value": "#000000"},
        {"name": "GRAY_2", "contrast": -1.24, "value": "#1f1f1f"},
        {"name": "GRAY_3", "contrast": 1, "value": "#303030"},
        {"name": "GRAY_4", "contrast": 1.24, "value": "#3f3f3f"},
        {"name": "GRAY_5", "contrast": 1.48, "value": "#4a4a4a"},
        {"name": "GRAY_6", "contrast": 2.2, "value": "#636363"},
        {"name": "GRAY_7", "contrast": 3.4, "value": "#818181"},
        {"name": "GRAY_8", "contrast": 5.2, "value": "#a3a3a3"},
        {"name": "GRAY_9", "contrast": 25, "value": "#ffffff"}
      ]
    },
    {
      "name": 'blue',
      "values": [
        {"name": "BLUE_LARGE_TEXT", "contrast": 3.4, "value": "#8e64ff"},
        {"name": "BLUE_TEXT", "contrast": 5.2, "value": "#b38fff"},
        {"name": "BLUE_HIGH_CONTRAST", "contrast": 9.4, "value": "#e4d2ff"},
        {"name": "BLUE_HIGHEST_CONTRAST", "contrast": 14.2, "value": "#ffffff"}
      ]
    },
    {
      "name": 'red',
      "values": [
        {"name": "red--largeText", "contrast": 3.4, "value": "#ff1919"},
        {"name": "red--text", "contrast": 5.2, "value": "#ff7a7a"},
        {"name": "red--highContrast", "contrast": 9.4, "value": "#ffcdcd"},
        {"name": "red--highestContrast", "contrast": 14.2, "value": "#ffffff"}
      ]
    }
  ]);
});

/** 
 * Single-color theme tests with fixed backround color.
 * These tests are for the new method of generating contrast
 * colors for a single color scale with a non-scale-based 
 * background. Replaces `new Color` function
 */

// Test simple generation in all color spaces
test('should generate 2 colors (CAM02 interpolation)', function() {
  let gray = new Color({
    name: 'gray',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'],
    colorspace: 'CAM02',
    ratios: [3, 4.5]
  });
  let theme = new Theme({colors: [gray], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#5490e0', '#2c66f1' ]);

});

test('should generate 2 named colors (CAM02 interpolation)', function() {
  let cerulean = new Color({
    name: 'Cerulean', 
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: 'CAM02'
  });
  let theme = new Theme({colors: [cerulean], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#5490e0', '#2c66f1' ]);

});

test('should generate 2 colors (LAB interpolation)', function() {
  let indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: 'LAB'
  });
  let theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#7383ff', '#435eff' ]);
});

test('should generate 2 colors (LCH interpolation)', function() {
  let indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: 'LCH'
  });
  let theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#008fff', '#0065ff' ]);
});

test('should generate 2 colors (HSL interpolation)', function() {
  let indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: 'HSL'
  });
  let theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#478cfe', '#2d62ff' ]);
});

test('should generate 2 colors (HSLuv interpolation)', function() {
  let indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: 'HSLuv'
  });
  let theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#1896dc', '#066aea' ]);
});

test('should generate 2 colors (HSV interpolation)', function() {
  let indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: 'HSV'
  });
  let theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#478cff', '#2d62ff' ]);
});

test('should generate 2 colors (RGB interpolation)', function() {
  let indigo = new Color({
    name: 'Indigo',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: 'RGB'
  });
  let theme = new Theme({colors: [indigo], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#5988ff', '#3360ff' ]);
});

test('should generate 2 colors on dark background', function() {
  let color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [3, 4.5], 
    colorspace: "LCH"
  }); 
  let theme = new Theme({colors: [color], backgroundColor: '#323232'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#0074ff', '#009fff' ]);
});

// Check bidirectionality of contrast ratios (positive vs negative)
test('should generate 2 colors with bidirectional contrast (light background)', function() {
  let color = new Color({
    name: 'Color',
    colorKeys: ["#012676"], 
    ratios: [-1.25,4.5], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#D8D8D8'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#efeff6', '#56599a' ]);
});

test('should generate 2 colors with bidirectional contrast (dark background)', function() {
  let color = new Color({
    name: 'Color',
    colorKeys: ["#012676"], 
    base: "#323232",
    ratios: [-1.25,4.5], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#323232'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#101c51', '#9695c0' ]);
});

// Contrast gamuts
test('should generate black when ratio darker than available colors', function() {
  let color = new Color({
    name: 'Color',
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    base: "#d8d8d8",
    ratios: [21], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#d8d8d8'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#000000' ]);
});

test('should generate white when ratio lighter than available colors', function() {
  let color = new Color({
    name: 'Color', 
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [21], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#323232'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#ffffff' ]);
});

test('should generate white when negative ratio lighter than available colors', function() {
  let color = new Color({
    name: 'Color', 
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [-21], 
    colorspace: "LCH"
  }); 
  let theme = new Theme({colors: [color], backgroundColor: '#f5f5f5'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#ffffff' ]);
});
test('should generate white when negative ratio lighter than available colors', function() {
  let color = new Color({
    name: 'Color', 
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [-21], 
    colorspace: "LCH"
  }); 
  let theme = new Theme({colors: [color], backgroundColor: '#ffffff'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#ffffff' ]);
});

test('should generate black when negative ratio lighter than available colors', function() {
  let color = new Color({
    name: 'Color', 
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [-21], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#323232'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#000000' ]);
});

test('should generate black when negative ratio lighter than available colors', function() {
  let color = new Color({
    name: 'Color', 
    colorKeys: ['#2451FF', '#C9FEFE', '#012676'], 
    ratios: [-21], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#000000'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#000000' ]);
});

// Mid-Tone Backgrounds
test('should generate slightly lighter & darker grays on a darker midtone gray background', function() {
  let color = new Color({
    name: 'Color',
    colorKeys: ['#000000'], 
    ratios: [1.2, -1.2], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#737373'}); 
  let themeColors = theme.contrastColorValues;

  expect(themeColors).toEqual([ '#808080', '#666666' ]);
});
test('should generate slightly lighter & darker grays on a lighter midtone gray background', function() {
  let color = new Color({
    name: 'Color', 
    colorKeys: ['#000000'], 
    ratios: [1.2, -1.2], 
    colorspace: "LCH"
  }); // positive & negative ratios
  let theme = new Theme({colors: [color], backgroundColor: '#787878'}); 
  let themeColors = theme.contrastColors;

  // expect(themeColors).toEqual([ '#6b6b6b', '#858585' ]);
  expect(themeColors).toEqual([
    { "background": "#787878" },
    {
      "name": 'Color',
      "values": [
        {"name": "Color50", "contrast": -1.2, "value": "#6b6b6b"},
        {"name": "Color100", "contrast": 1.2, "value": "#858585"},
      ]
    }
  ]);
});
// test('should generate slightly lighter & darker oranges on a darker midtone slate background', function() {
//   let color = new Color({
//     name: 'Color', 
//     colorKeys: ["#ff8602","#ab3c00","#ffd88b"], 
//     ratios: [1.2, -1.2], 
//     colorspace: "LCH"
//   }); // positive & negative ratios
//   let theme = new Theme({colors: [color], backgroundColor: '#537a9c'}); 
//   let themeColors = theme.contrastColorValues;

//   expect(themeColors).toEqual([ '#d66102', '#b64601' ]);
// });
// test('should generate slightly lighter & darker oranges on a lighter midtone slate background', function() {
//   let color = new Color({
//     name: 'Color', 
//     colorKeys: ["#ff8602","#ab3c00","#ffd88b"], 
//     ratios: [1.2, -1.2], 
//     colorspace: "LCH"
//   }); // positive & negative ratios
//   let theme = new Theme({colors: [color], backgroundColor: '#537a9c'}); 
//   let themeColors = theme.contrastColorValues;

//   expect(themeColors).toEqual([ '#b84601', '#d76202' ]);
// });





// // Output formats 
// test('should generate 2 colors in HEX format', function() {
//   let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'CAM02'});;

//   expect(colors).toEqual([ '#5490e0', '#2c66f1' ]);
// });
// test('should generate 2 colors in RGB format', function() {
//   let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'CAM02', output: 'RGB'});;

//   expect(colors).toEqual([ 'rgb(84, 144, 224)', 'rgb(44, 102, 241)' ]);
// });
// test('should generate 2 colors in HSL format', function() {
//   let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'CAM02', output: 'HSL'});;

//   expect(colors).toEqual([ 'hsl(214deg, 69%, 60%)', 'hsl(222deg, 88%, 56%)' ]);
// });
// test('should generate 2 colors in HSV format', function() {
//   let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'CAM02', output: 'HSV'});;

//   expect(colors).toEqual([ 'hsv(214deg, 63%, 88%)', 'hsv(222deg, 82%, 95%)' ]);
// });
// test('should generate 2 colors in LAB format', function() {
//   let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'CAM02', output: 'LAB'});;

//   expect(colors).toEqual([ 'lab(58%, -1, -47)', 'lab(46%, 22, -77)' ]);
// });
// test('should generate 2 colors in LCH format', function() {
//   let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5', ratios: [3, 4.5], colorspace: 'CAM02', output: 'LCH'});;

//   expect(colors).toEqual([ 'lch(58%, 47, 269deg)', 'lch(46%, 80, 286deg)' ]);
// });

// // Expected errors
// test('should generate no colors, missing colorKeys', function() {
//   expect(
//     () => {
//       let color = new Color({base: '#f5f5f5', ratios: [3, 4.5]}) // no key colors
//     }
//   ).toThrow();
// });

// test('should generate no colors, missing ratios', function() {

//   expect(
//     () => {
//       let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], base: '#f5f5f5'}) // no ratios
//     }
//   ).toThrow();
// });

// test('should generate no colors, missing base', function() {
//   expect(
//     () => {
//       let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEFE', '#012676'], ratios: [3, 4.5]}) // no base
//     }
//   ).toThrow();
// });

// test('should throw error, missing hash on hex value', function() {
//   expect(
//     () => {
//       let color = new Color({name: 'Color', colorKeys: ['#2451FF', 'C9FEFE', '#012676'], ratios: [3, 4.5]}) // third color missing hash #
//     }
//   ).toThrow();
// });

// test('should throw error, incomplete hex value', function() {
//   expect(
//     () => {
//       let color = new Color({name: 'Color', colorKeys: ['#2451FF', '#C9FEF', '#012676'], ratios: [3, 4.5]}) // third color missing final hex code
//     }
//   ).toThrow();
// });
