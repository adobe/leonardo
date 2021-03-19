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


