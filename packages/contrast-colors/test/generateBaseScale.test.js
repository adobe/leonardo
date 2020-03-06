/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { generateBaseScale } from '../index.js';

// Test simple generation in all color spaces
test('should generate 101 grayscale colors in default LAB colorspace)', function() {
  let colors = generateBaseScale({colorKeys: ['#ffffff'], smooth: false});;

  expect(colors).toEqual([ '#000000', '#020202', '#060606', '#0a0a0a', '#0d0d0d', '#101010', '#131313', '#151515', '#171717', '#191919', '#1b1b1b', '#1d1d1d', '#1f1f1f', '#212121', '#232323', '#252525', '#272727', '#292929', '#2b2b2b', '#2e2e2e', '#303030', '#323232', '#343434', '#363636', '#383838', '#3b3b3b', '#3d3d3d', '#3f3f3f', '#414141', '#444444', '#464646', '#484848', '#4b4b4b', '#4d4d4d', '#4f4f4f', '#525252', '#545454', '#565656', '#595959', '#5b5b5b', '#5e5e5e', '#606060', '#626262', '#656565', '#676767', '#6a6a6a', '#6c6c6c', '#6f6f6f', '#717171', '#747474', '#767676', '#797979', '#7b7b7b', '#7e7e7e', '#808080', '#838383', '#858585', '#888888', '#8b8b8b', '#8d8d8d', '#909090', '#929292', '#959595', '#989898', '#9a9a9a', '#9d9d9d', '#a0a0a0', '#a2a2a2', '#a5a5a5', '#a8a8a8', '#aaaaaa', '#adadad', '#b0b0b0', '#b2b2b2', '#b5b5b5', '#b8b8b8', '#bababa', '#bdbdbd', '#c0c0c0', '#c3c3c3', '#c5c5c5', '#c8c8c8', '#cbcbcb', '#cecece', '#d1d1d1', '#d3d3d3', '#d6d6d6', '#d9d9d9', '#dcdcdc', '#dfdfdf', '#e1e1e1', '#e4e4e4', '#e7e7e7', '#eaeaea', '#ededed', '#f0f0f0', '#f3f3f3', '#f5f5f5', '#f8f8f8', '#fbfbfb', '#fefefe' ]);

});

test('should generate 101 blue toned grayscale colors in HSL space)', function() {
  let colors = generateBaseScale({colorKeys: ['#4a5b7b','#72829c','#a6b2c6'], colorspace: 'HSL', smooth: false});;

  expect(colors).toEqual([ '#000000', '#020203', '#050608', '#080a0d', '#0a0d11', '#0d1015', '#0f1319', '#11151c', '#12171f', '#141921', '#161b24', '#171d27', '#191f2a', '#1b212c', '#1c232f', '#1e2532', '#202734', '#222938', '#242c3b', '#252e3e', '#273040', '#283243', '#2a3446', '#2c374a', '#2e394d', '#303b4f', '#313d52', '#343f56', '#354259', '#37445b', '#39465e', '#3b4862', '#3d4b65', '#3e4d68', '#414f6b', '#42526e', '#445471', '#465775', '#485978', '#4a5b7c', '#4c5e7e', '#4f6080', '#516383', '#536585', '#566887', '#586a89', '#5b6d8c', '#5d6f8e', '#607291', '#627493', '#657795', '#687a98', '#6a7c99', '#6e7f9a', '#70819b', '#74849e', '#7686a0', '#7989a2', '#7c8ba5', '#7e8ea7', '#8291a9', '#8493ab', '#8796ae', '#8a98b0', '#8c9bb2', '#8f9eb5', '#93a0b7', '#95a3b9', '#98a6bc', '#9ba8be', '#9eabc0', '#a1aec2', '#a4b0c4', '#a7b3c7', '#aab6c9', '#aeb9cb', '#b0bbcc', '#b3becf', '#b7c0d1', '#bac3d3', '#bdc6d4', '#c0c9d7', '#c4ccd9', '#c6cedb', '#c9d1dd', '#cdd4df', '#d1d7e1', '#d3d9e3', '#d6dce5', '#d9dfe7', '#dde2e9', '#e1e5eb', '#e3e7ed', '#e6eaef', '#eaedf1', '#edf0f4', '#f1f3f6', '#f4f5f8', '#f7f8fa', '#fafbfc', '#fdfefe' ]);

});

test('should generate 101 blue toned grayscale colors in LAB space)', function() {
  let colors = generateBaseScale({colorKeys: ['#4a5b7b','#72829c','#a6b2c6'], colorspace: 'LAB', smooth: false});;

  expect(colors).toEqual([ '#000000', '#020202', '#050608', '#080a0d', '#0b0d10', '#0e1013', '#111317', '#131519', '#14171c', '#16191e', '#181b21', '#191d24', '#1b1f27', '#1c2129', '#1e232c', '#20252f', '#212732', '#232935', '#252b39', '#272e3c', '#28303e', '#2a3241', '#2b3444', '#2e3647', '#2f394b', '#313b4e', '#333d50', '#343f54', '#364257', '#38445a', '#39465d', '#3c4861', '#3d4b64', '#3f4d67', '#414f6b', '#43526e', '#445471', '#475675', '#485978', '#4b5c7b', '#4d5e7d', '#4f607f', '#526382', '#546583', '#576886', '#596a88', '#5c6d8a', '#5e6f8c', '#61728e', '#647490', '#677793', '#697995', '#6c7c97', '#6f7f99', '#71819b', '#74849d', '#7786a0', '#7989a2', '#7c8ca4', '#7f8ea6', '#8291a9', '#8493ab', '#8796ad', '#8a98b0', '#8d9bb2', '#909eb4', '#93a0b6', '#95a3b9', '#99a6bb', '#9ca8be', '#9eabc0', '#a1aec2', '#a4b0c4', '#a7b3c7', '#aab6c9', '#aeb9cb', '#b0bbcd', '#b4becf', '#b7c0d1', '#bac3d3', '#bdc6d5', '#c0c9d7', '#c4ccd9', '#c6cedb', '#cad1dd', '#cdd4df', '#d1d7e1', '#d3d9e3', '#d6dce5', '#dadfe7', '#dde2e9', '#e1e5ec', '#e3e7ed', '#e7eaef', '#eaedf1', '#edf0f4', '#f1f2f6', '#f4f5f8', '#f7f8fa', '#fafbfc', '#fdfefe' ]);

});

test('should generate 101 blue colors in HSLuv space)', function() {
  let colors = generateBaseScale({colorKeys: ['#6FA7FF', '#B5E6FF'], colorspace: 'HSLuv', smooth: false});;

  expect(colors).toEqual([ '#000001', '#000207', '#000612', '#000a1b', '#000d20', '#001025', '#00132a', '#00152e', '#001731', '#001935', '#001b38', '#001d3b', '#001f3f', '#002143', '#002347', '#00254b', '#00284e', '#002a52', '#002c55', '#002e59', '#00305c', '#003260', '#003465', '#003768', '#00396c', '#003b6f', '#003d74', '#004078', '#00427b', '#00447f', '#004784', '#004987', '#004b8b', '#004d90', '#005094', '#005297', '#00559c', '#00579f', '#0059a4', '#005ca8', '#005eac', '#0061b1', '#0063b4', '#0066b9', '#0068bd', '#006ac2', '#006dc5', '#0070cb', '#0072ce', '#0074d3', '#0077d7', '#0079dc', '#007ce0', '#007fe4', '#0081e8', '#0084ed', '#0086f2', '#0089f6', '#008cfb', '#008efe', '#2191ff', '#2f93ff', '#3b96ff', '#4799ff', '#4e9bff', '#579eff', '#5da0ff', '#64a3ff', '#6ca6ff', '#6fa9ff', '#70acff', '#71b0ff', '#73b3ff', '#75b6ff', '#77baff', '#79bdff', '#7cc0ff', '#7fc3ff', '#82c7ff', '#86caff', '#8acdff', '#8ed0ff', '#92d2ff', '#96d5ff', '#9ad8ff', '#9fdbff', '#a4deff', '#aae1ff', '#aee3ff', '#b4e6ff', '#bbe8ff', '#c1eaff', '#c9ecff', '#d1efff', '#d7f1ff', '#ddf3ff', '#e3f5ff', '#eaf7ff', '#f1faff', '#f6fcff', '#fcfeff' ]);

});
