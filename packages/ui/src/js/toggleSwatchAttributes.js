

function toggleSwatchAttributes(e) {
  let on = e.target.checked;
  let wrapper = document.getElementById('swatchesOutputs');

  if(!on) {
    wrapper.classList.add('hideSwatchAttributes')
  } else {
    wrapper.classList.remove('hideSwatchAttributes')
  }
}

const toggleSwitch = document.getElementById('swatchAttributeSwitch');
toggleSwitch.addEventListener('change', toggleSwatchAttributes);

window.toggleSwatchAttributes = toggleSwatchAttributes;

module.exports = {
  toggleSwatchAttributes
}