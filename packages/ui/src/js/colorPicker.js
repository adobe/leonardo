
import {createHtmlElement} from './createHtmlElement';
import {randomId} from './utils';
const chroma = require('chroma-js');
const { extendChroma } = require('./chroma-plus');

function createColorPicker(dest) {
  const random = randomId();
  const thisId = `${random}_colorPicker`;
  const thisInputId = `${random}_colorPickerInput`;
  createHtmlElement({
    element: 'div',
    className: 'colorPicker',
    id: thisId,
    appendTo: dest
  }),
  createHtmlElement({
    element: 'input',
    type: 'color',
    className: 'colorPicker-Input',
    style: {
      display: 'none'
    },
    id: thisInputId,
    appendTo: thisId
  }),
  
  document.getElementById(thisId).addEventListener('click', colorPicker)
}

const colorPicker = (e) => {
  // Prevent color input from appearing
  e.preventDefault();
  let colorChannels = [0, 0, 0];
  const id = e.target.id.replace('_colorPicker', '');
  const pickerId = id.concat('_colorPicker');
  const inputId = id.concat('_colorPickerInput');
  const popoverId = id.concat('_colorPickerPopover');
  let hasPopover = (document.getElementById(popoverId)) ? true : false;
  console.log(hasPopover)
  // Display picker controls in UI
  // Should only display if popover isn't already present
  if(!hasPopover) {
    createHtmlElement({
      element: 'div',
      className: 'spectrum-Popover is-open colorPicker-Popover',
      id: popoverId,
      innerHTML: 'Im a popover, and Im ok',
      appendTo: pickerId
    })
  }

  // Create form
  const form = document.createElement('div')
  form.className = 'spectrum-Form'

  // Create selector for colorspace
  let interp = document.createElement('div');
  interp.className = 'spectrum-Form-item spectrum-Form-item--row';
  let interpLabel = document.createElement('label');
  interpLabel.className = 'spectrum-FieldLabel spectrum-Fieldlabel--sizeM spectrum-FieldLabel--left';
  interpLabel.for = id.concat('_mode');
  let interpLabelText = 'Color space';
  let interpSelect = document.createElement('select');
  interpSelect.className = 'spectrum-Picker spectrum-Picker--sizeM pickerMode';
  interpSelect.id = id.concat('_mode');
  interpSelect.name = id.concat('_mode');
  interpSelect.addEventListener('change', (e) => {
    console.log(e.target.value)
  })

  let interpDropdownIcon = document.createElement('span');
  interpDropdownIcon.className = 'spectrum-Picker-iconWrapper';
  interpDropdownIcon.innerHTML = `
  <svg xmlns:xlink="http://www.w3.org/1999/xlink" class="spectrum-Picker-icon spectrum-UIIcon-ChevronDownMedium spectrum-Picker-icon">
    <use xlink:href="#spectrum-css-icon-ChevronDownMedium"></use>
  </svg>`;

  interpLabel.innerHTML = interpLabelText;
  // interpDropdown.appendChild(interpSelect);
  interpSelect.appendChild(interpDropdownIcon);
  interp.appendChild(interpLabel);
  interp.appendChild(interpSelect);

  // Interpolation options
  interpSelect.options.length = 0;

  let opts = {
    'CAM02': 'Jab',
    'CAM02p': 'JCh',
    'LCH': 'Lch',
    'LAB': 'Lab',
    'HSL': 'HSL',
    'HSLuv': 'HSLuv',
    'HSV': 'HSV',
    'RGB': 'RGB'
  };

  for(let index in opts) { interpSelect.options[interpSelect.options.length] = new Option(opts[index], index); }
  interpSelect.value = 'RGB';

  form.appendChild(interpSelect);

  // Create sliders
  // May want to loop this...
  const channels = 3;
  for(let i = 0; i < channels; i++) {
    const channelItem = document.createElement('div')
    channelItem.className = 'spectrum-Form-item';
    const channel = document.createElement('div');
    channel.className = 'spectrum-Slider'
    channel.id = `${id}_ch${i}`;
    const channelLabelWrapper = document.createElement('div')
    channelLabelWrapper.className = 'spectrum-Slider-labelContainer';
    const channelLabel = document.createElement('label');
    channelLabel.className = 'spectrum-Slider-label';
    channelLabel.for = `${id}_ch${i}-Input`;
    const channelInput = document.createElement('input');
    channelInput.className = `spectrum-Slider-controls`
    channelInput.type = 'range';
    channelInput.oninput = (e) => {
      colorChannels[i] = Number(e.target.value); 
      let color = chroma.rgb(colorChannels).hex();
      console.log(color);
      document.getElementById(inputId).value = color;    
      document.getElementById(pickerId).style.backgroundColor = color;
    }
    channelInput.min = 0;
    channelInput.max = 255;
    channelInput.name = `${id}_ch${i}-Input`;
    channelInput.id = `${id}_ch${i}-Input`;
  
    channelLabelWrapper.appendChild(channelLabel);
    channel.appendChild(channelLabelWrapper);
    channel.appendChild(channelInput);
    channelItem.appendChild(channel);
  
    form.appendChild(channelItem);
  }

  document.getElementById(popoverId).appendChild(form)
}

module.exports = {
  colorPicker,
  createColorPicker
}