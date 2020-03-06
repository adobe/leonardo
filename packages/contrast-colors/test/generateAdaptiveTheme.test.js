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

import { generateAdaptiveTheme } from '../index.js';

test('should generate theme for three colors', function() {
  let theme = generateAdaptiveTheme({
    baseScale: "gray",
    colorScales: [
      {
        name: "gray",
        colorKeys: ['#cacaca', '#323232'],
        colorspace: 'HSL',
        ratios: [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21],
        smooth: false
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      }
    ]});
    let themeLight = theme(90);;

    expect(themeLight).toEqual([
      { background: "#e1e1e1" },
      {
        name: 'gray',
        values: [
          {name: "gray100", contrast: 1, value: "#e0e0e0"},
          {name: "gray200", contrast: 1.2, value: "#cecece"},
          {name: "gray300", contrast: 1.4, value: "#bfbfbf"},
          {name: "gray400", contrast: 2, value: "#a0a0a0"},
          {name: "gray500", contrast: 3, value: "#808080"},
          {name: "gray600", contrast: 4.5, value: "#646464"},
          {name: "gray700", contrast: 6, value: "#525252"},
          {name: "gray800", contrast: 8, value: "#404040"},
          {name: "gray900", contrast: 12, value: "#232323"},
          {name: "gray1000", contrast: 21, value: "#000000"}
        ]
      },
      {
        name: 'blue',
        values: [
          {name: "blue100", contrast: 2, value: "#b18cff"},
          {name: "blue200", contrast: 3, value: "#8d63ff"},
          {name: "blue300", contrast: 4.5, value: "#623aff"},
          {name: "blue400", contrast: 8, value: "#1c0ad1"},
          {name: "blue500", contrast: 12, value: "#211068"}
        ]
      },
      {
        name: 'red',
        values: [
          {name: "red100", contrast: 2, value: "#ff7474"},
          {name: "red200", contrast: 3, value: "#ff1313"},
          {name: "red300", contrast: 4.5, value: "#cc0000"},
          {name: "red400", contrast: 8, value: "#860000"},
          {name: "red500", contrast: 12, value: "#500000"}
        ]
      }
    ]);

});

test('should generate theme for three colors with negative ratios', function() {
  let theme = generateAdaptiveTheme({
    baseScale: "gray",
    colorScales: [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21],
        smooth: false
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      }
    ]});
    let themeLight = theme(90);;

    expect(themeLight).toEqual([
        { background: "#e1e1e1" },
        {
          name: "gray",
          values: [
            {name: "gray33", contrast: -1.8, value: "#ffffff"},
            {name: "gray67", contrast: -1.2, value: "#f5f5f5"},
            {name: "gray100", contrast: 1, value: "#e0e0e0"},
            {name: "gray200", contrast: 1.2, value: "#cecece"},
            {name: "gray300", contrast: 1.4, value: "#c0c0c0"},
            {name: "gray400", contrast: 2, value: "#a0a0a0"},
            {name: "gray500", contrast: 3, value: "#808080"},
            {name: "gray600", contrast: 4.5, value: "#646464"},
            {name: "gray700", contrast: 6, value: "#525252"},
            {name: "gray800", contrast: 8, value: "#404040"},
            {name: "gray900", contrast: 12, value: "#242424"},
            {name: "gray1000", contrast: 21, value: "#000000"}
          ]
        },
        {
          name: "blue",
          values: [
            {name: "blue100", contrast: 2, value: "#b18cff"},
            {name: "blue200", contrast: 3, value: "#8d63ff"},
            {name: "blue300", contrast: 4.5, value: "#623aff"},
            {name: "blue400", contrast: 8, value: "#1c0ad1"},
            {name: "blue500", contrast: 12, value: "#211068"}
          ]
        },
        {
          name: "red",
          values: [
            {name: "red100", contrast: 2, value: "#ff7474"},
            {name: "red200", contrast: 3, value: "#ff1313"},
            {name: "red300", contrast: 4.5, value: "#cc0000"},
            {name: "red400", contrast: 8, value: "#860000"},
            {name: "red500", contrast: 12, value: "#500000"}
          ]
        }
      ]);
});

test('should generate theme for three colors using variables as parameters', function() {
  let tempRatios = [2, 3, 4.5, 8, 12];
  let baseRatios = [1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21];
  let gray = {
    name: "gray",
    colorKeys: ['#cacaca'],
    colorspace: 'HSL',
    ratios: baseRatios,
    smooth: false
  };
  let blue = {
    name: "blue",
    colorKeys: ['#0000ff'],
    colorspace: 'LAB',
    ratios: tempRatios,
    smooth: false
  };
  let red = {
    name: "red",
    colorKeys: ['#ff0000'],
    colorspace: 'RGB',
    ratios: tempRatios,
    smooth: false
  };
  let brightness = 90;

  let theme = generateAdaptiveTheme({baseScale: gray.name, colorScales: [gray, blue, red]});
  let themeLight = theme(90);;

  expect(themeLight).toEqual([
    { background: "#e1e1e1" },
    {
      name: 'gray',
      values: [
        {name: "gray100", contrast: 1, value: "#e0e0e0"},
        {name: "gray200", contrast: 1.2, value: "#cecece"},
        {name: "gray300", contrast: 1.4, value: "#c0c0c0"},
        {name: "gray400", contrast: 2, value: "#a0a0a0"},
        {name: "gray500", contrast: 3, value: "#808080"},
        {name: "gray600", contrast: 4.5, value: "#646464"},
        {name: "gray700", contrast: 6, value: "#525252"},
        {name: "gray800", contrast: 8, value: "#404040"},
        {name: "gray900", contrast: 12, value: "#242424"},
        {name: "gray1000", contrast: 21, value: "#000000"}
      ]
    },
    {
      name: 'blue',
      values: [
        {name: "blue100", contrast: 2, value: "#b18cff"},
        {name: "blue200", contrast: 3, value: "#8d63ff"},
        {name: "blue300", contrast: 4.5, value: "#623aff"},
        {name: "blue400", contrast: 8, value: "#1c0ad1"},
        {name: "blue500", contrast: 12, value: "#211068"}
      ]
    },
    {
      name: 'red',
      values: [
        {name: "red100", contrast: 2, value: "#ff7474"},
        {name: "red200", contrast: 3, value: "#ff1313"},
        {name: "red300", contrast: 4.5, value: "#cc0000"},
        {name: "red400", contrast: 8, value: "#860000"},
        {name: "red500", contrast: 12, value: "#500000"}
      ]
    }
  ]);

});

test('should generate theme with increased contrast', function() {
  let theme = generateAdaptiveTheme({
    baseScale: 'gray',
    colorScales: [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21],
        smooth: false
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      }
    ]});
    let themeLight = theme(90, 1.4);;

    expect(themeLight).toEqual([
      { background: "#e1e1e1" },
      {
        name: 'gray',
        values: [
          {name: "gray33", contrast: -2.12, value: "#ffffff"},
          {name: "gray67", contrast: -1.28, value: "#fdfdfd"},
          {name: "gray100", contrast: 1, value: "#e0e0e0"},
          {name: "gray200", contrast: 1.28, value: "#c8c8c8"},
          {name: "gray300", contrast: 1.56, value: "#b5b5b5"},
          {name: "gray400", contrast: 2.4, value: "#929292"},
          {name: "gray500", contrast: 3.8, value: "#707070"},
          {name: "gray600", contrast: 5.9, value: "#525252"},
          {name: "gray700", contrast: 8, value: "#404040"},
          {name: "gray800", contrast: 10.8, value: "#2c2c2c"},
          {name: "gray900", contrast: 16.4, value: "#000000"},
          {name: "gray1000", contrast: 29, value: "#000000"}
        ]
      },
      {
        name: 'blue',
        values: [
          {name: "blue100", contrast: 2.4, value: "#a179ff"},
          {name: "blue200", contrast: 3.8, value: "#764bff"},
          {name: "blue300", contrast: 5.9, value: "#3418ff"},
          {name: "blue400", contrast: 10.8, value: "#231086"},
          {name: "blue500", contrast: 16.4, value: "#000000"}
        ]
      },
      {
        name: 'red',
        values: [
          {name: "red100", contrast: 2.4, value: "#ff5555"},
          {name: "red200", contrast: 3.8, value: "#e10000"},
          {name: "red300", contrast: 5.9, value: "#aa0000"},
          {name: "red400", contrast: 10.8, value: "#5f0000"},
          {name: "red500", contrast: 16.4, value: "#000000"}
        ]
      }
    ]);

});

test('should generate white theme with increased contrast', function() {
  let theme = generateAdaptiveTheme({
    baseScale: 'gray',
    colorScales: [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21],
        smooth: false;
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false;
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false;
      }
    ]});
    let themeLight = theme(100, 2);;

    expect(themeLight).toEqual([
      { background: "#fefefe" },
      {
        name: 'gray',
        values: [
          {name: "gray33", contrast: -2.6, value: "#ffffff"},
          {name: "gray67", contrast: -1.4, value: "#ffffff"},
          {name: "gray100", contrast: 1, value: "#fefefe"},
          {name: "gray200", contrast: 1.4, value: "#d9d9d9"},
          {name: "gray300", contrast: 1.8, value: "#c0c0c0"},
          {name: "gray400", contrast: 3, value: "#949494"},
          {name: "gray500", contrast: 5, value: "#6f6f6f"},
          {name: "gray600", contrast: 8, value: "#505050"},
          {name: "gray700", contrast: 11, value: "#3b3b3b"},
          {name: "gray800", contrast: 15, value: "#272727"},
          {name: "gray900", contrast: 23, value: "#000000"},
          {name: "gray1000", contrast: 41, value: "#000000"}
        ]
      },
      {
        name: 'blue',
        values: [
          {name: "blue100", contrast: 3, value: "#a47cff"},
          {name: "blue200", contrast: 5, value: "#744aff"},
          {name: "blue300", contrast: 8, value: "#2610ff"},
          {name: "blue400", contrast: 15, value: "#221073"},
          {name: "blue500", contrast: 23, value: "#000000"}
        ]
      },
      {
        name: 'red',
        values: [
          {name: "red100", contrast: 3, value: "#ff5c5c"},
          {name: "red200", contrast: 5, value: "#e00000"},
          {name: "red300", contrast: 8, value: "#a60000"},
          {name: "red400", contrast: 15, value: "#560000"},
          {name: "red500", contrast: 23, value: "#000000"}
        ]
      }
    ]);

});

test('should generate dark theme with increased contrast', function() {
  let theme = generateAdaptiveTheme({
    baseScale: 'gray',
    colorScales: [
      {
        name: "gray",
        colorKeys: ['#cacaca'],
        colorspace: 'HSL',
        ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21],
        smooth: false
      },
      {
        name: "blue",
        colorKeys: ['#0000ff'],
        colorspace: 'LAB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      },
      {
        name: "red",
        colorKeys: ['#ff0000'],
        colorspace: 'RGB',
        ratios: [2, 3, 4.5, 8, 12],
        smooth: false
      }
    ]});
    let themeLight = theme(20, 1.5);;

    expect(themeLight).toEqual([
      { background: "#303030" },
      {
        name: 'gray',
        values: [
          {name: "gray33", contrast: -2.2, value: "#000000"},
          {name: "gray67", contrast: -1.3, value: "#1c1c1c"},
          {name: "gray100", contrast: 1, value: "#303030"},
          {name: "gray200", contrast: 1.3, value: "#414141"},
          {name: "gray300", contrast: 1.6, value: "#4f4f4f"},
          {name: "gray400", contrast: 2.5, value: "#6b6b6b"},
          {name: "gray500", contrast: 4, value: "#8e8e8e"},
          {name: "gray600", contrast: 6.25, value: "#b3b3b3"},
          {name: "gray700", contrast: 8.5, value: "#d0d0d0"},
          {name: "gray800", contrast: 11.5, value: "#efefef"},
          {name: "gray900", contrast: 17.5, value: "#ffffff"},
          {name: "gray1000", contrast: 31, value: "#ffffff"}
        ]
      },
      {
        name: 'blue',
        values: [
          {name: "blue100", contrast: 2.5, value: "#6f45ff"},
          {name: "blue200", contrast: 4, value: "#9d73ff"},
          {name: "blue300", contrast: 6.25, value: "#c3a3ff"},
          {name: "blue400", contrast: 11.5, value: "#f4edff"},
          {name: "blue500", contrast: 17.5, value: "#ffffff"}
        ]
      },
      {
        name: 'red',
        values: [
          {name: "red100", contrast: 2.5, value: "#da0000"},
          {name: "red200", contrast: 4, value: "#ff4b4b"},
          {name: "red300", contrast: 6.25, value: "#ff9494"},
          {name: "red400", contrast: 11.5, value: "#ffebeb"},
          {name: "red500", contrast: 17.5, value: "#ffffff"}
        ]
      }
    ]);
});


// Should throw errors
test('should throw error, not valid base scale option', function() {
  expect(
    () => {
      let theme = generateAdaptiveTheme({
        baseScale: 'orange',
        colorScales: [
          {
            name: "gray",
            colorKeys: ['#cacaca'],
            colorspace: 'HSL',
            ratios: [-1.8, -1.2, 1, 1.2, 1.4, 2, 3, 4.5, 6, 8, 12, 21],
            smooth: false
          },
          {
            name: "blue",
            colorKeys: ['#0000ff'],
            colorspace: 'LAB',
            ratios: [2, 3, 4.5, 8, 12],
            smooth: false
          },
          {
            name: "red",
            colorKeys: ['#ff0000'],
            colorspace: 'RGB',
            ratios: [2, 3, 4.5, 8, 12],
            smooth: false
          }
        ],
        brightness: 97
      });
    }
  ).toThrow();
});
