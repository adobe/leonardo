
class SpectrumColorHandle extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'value':
        this.style.backgroundColor = this.value;
        this._loupeInner.style.fill = this.value;
        break;
      case 'disabled':
        this._input.disabled = this.disabled;
        this.classList[this.disabled ? 'add' : 'remove']('is-disabled');
        this[!this.disabled ? 'setAttribute' : 'removeAttribute']('tabindex', '0');
        break;
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(disabled) {
    this[disabled ? 'setAttribute' : 'removeAttribute']('disabled', '');
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  _handleMouseDown() {
    this.classList.add('is-active');
  }

  _handleMouseUp() {
    this.classList.remove('is-active');
  }

  _render() {
    this.classList.add('spectrum-ColorHandle');

    let template = document.querySelector('#spectrum-ColorHandle');
    this.appendChild(template.content.cloneNode(true));

    this._loupe = this.querySelector('.js-loupe');
    this._loupeInner = this.querySelector('.js-loupeInner');

    this._handleMouseUp = this._handleMouseUp.bind(this);
    this.addEventListener('mousedown', this._handleMouseDown);
    window.addEventListener('mouseup', this._handleMouseUp);
  }

  constructor() {
    super();

    this._render();
  }
}
customElements.define('spectrum-colorhandle', SpectrumColorHandle);

class SpectrumColorControl extends HTMLElement {
  _colorSpace = 'hsv'
  _chromaColor = chroma('black')

  _setColorSpace() {
    if (this.value.substr(0,3), 'rgb') {
      this._colorSpace = 'rgb';
    }
    else if (this.value.substr(0,3), 'hsv') {
      this._colorSpace = 'hsv';
    }
    else if (this.value.substr(0,3), 'hsl') {
      this._colorSpace = 'hsl';
    }
  }

  static get observedAttributes() {
    return ['disabled', 'value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'value':
        this._setColorSpace();
        this._input.value = this.value;
        this._handle.value = this.value;
        this._setChromaFromValue(this.value);
        break;
      case 'disabled':
        this._input.disabled = this.disabled;
        this.classList[this.disabled ? 'add' : 'remove']('is-disabled');
        this[!this.disabled ? 'setAttribute' : 'removeAttribute']('tabindex', '0');
        break;
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(disabled) {
    this[disabled ? 'setAttribute' : 'removeAttribute']('disabled', '');
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(value) {
    this._setChromaFromValue(value);
    this.setAttribute('value', value);
  }

  _getComponentSpaceCoordinates(e) {
    let x = e.clientX - this._rect.left;
    let y = e.clientY - this._rect.top;
    return { x: x, y: y };
  }

  _handleMouseMove(e) {
    this._coordinates = this._getComponentSpaceCoordinates(e);
    this._setValueFromCoordinates(this._coordinates);
  }

  _setValueFromCoordinates(coordinates) {
    let event = new Event('change', { bubbles: true });
    this.dispatchEvent(event);
  }

  _handleMouseUp() {
    this._handle.classList.remove('is-active');
  }

  _followMouse() {
    this.classList.add('is-dragging');
    this._handle.classList.add('is-active');

    window.addEventListener('mousemove', this._handleMouseMove);

    window.addEventListener('mouseup', e => {
      this._handleMouseUp(e);
      this.classList.remove('is-dragging');
      window.removeEventListener('mousemove', this._handleMouseMove);
    });
  }

  _handleMouseDown(e) {
    let coordinates = this._getComponentSpaceCoordinates(e);
    this._coordinates.x = coordinates.x;
    this._coordinates.y = coordinates.y;
  }

  _setChromaFromValue(value) {
    this._chromaColor = chroma(value);
  }

  _setValueFromChroma() {
    this.value = this._chromaColor.css(this._colorSpace);
  }

  _clamp(v, min, max) {
    return Math.min(max, Math.max(v, min));
  }

  constructor() {
    super();

    this._offsetCoordinates = {
      x: 0,
      y: 0
    };

    this._coordinates = {
      x: 0,
      y: 0
    };

    this._render();

    this._rect = this.getBoundingClientRect();

    this._track = this.querySelector('.js-track');
    this._handle = this.querySelector('.js-handle');
    this._input = this.querySelector('.js-input');

    this.addEventListener('focusin', e => {
      if (e.target.classList.contains('focus-ring')) {
        this.classList.add('is-focused');
      }
    });

    this.addEventListener('focusout', e => {
      this.classList.remove('is-focused');
    });

    this._handleMouseMove = this._handleMouseMove.bind(this);

    this._handle.addEventListener('mousedown', e => {
      if (this.disabled) {
        return;
      }

      // Don't let the tarck get the click
      e.stopPropagation();
      this._rect = this.getBoundingClientRect();
      this._handleMouseDown(e);
      this._followMouse();
    });

    this._track.addEventListener('mousedown', e => {
      if (this.disabled) {
        return;
      }
      this._rect = this.getBoundingClientRect();
      this._handleMouseMove(e);
      this._followMouse();
    });
  }
}

class SpectrumColorWheel extends SpectrumColorControl {
  _hOffset = 0
  _drawOffset = 90

  attributeChangedCallback(name, oldValue, newValue) {
    SpectrumColorControl.prototype.attributeChangedCallback.apply(this, arguments);
    switch (name) {
      case 'disabled':
        this._slider.disabled = this.disabled;
        break;
      case 'value':
        this._handleContainer.style.transform = 'rotate('+(this._chromaColor.get('hsl.h') - this._drawOffset)+'deg) translate(67.5px)';
        this._handle.style.transform = 'rotate('+((this._chromaColor.get('hsl.h') - this._drawOffset) * -1)+'deg)';

        this._handle.value = this.value;

        this._slider.value = this._chromaColor.get('hsv.h');

        if (newValue != oldValue) {
          this._setGradientColor();
        }
        break;
    }
  }

  _getAngleFromCoordinates(coordinates) {
    coordinates.x = coordinates.x - 160/2;
    coordinates.y = coordinates.y - 160/2;
    let angle = Math.atan2(coordinates.y, coordinates.x) * (180 / Math.PI) + this._drawOffset;
    if (angle < 0) {
      // Stay positive
      angle = angle += 360;
    }
    return angle;
  }

  _setValueFromCoordinates(coordinates) {
    this._chromaColor = this._chromaColor.set('hsl.h', this._getAngleFromCoordinates(coordinates) + this._hOffset);
    this._setValueFromChroma();

    SpectrumColorControl.prototype._setValueFromCoordinates.apply(this, arguments);
  }

  _deg2hsl(degree) {
    return this._chromaColor.set('hsv.h', degree).css('hsl');
  }

  _handleMouseDown(e) {
    SpectrumColorControl.prototype._handleMouseDown.apply(this, arguments);

    this._hOffset = this._chromaColor.get('hsl.h') - this._getAngleFromCoordinates(this._coordinates);
  }

  _handleMouseUp(e) {
    SpectrumColorControl.prototype._handleMouseUp.apply(this, arguments);

    this._hOffset = 0;
    this._slider.focus();
  }

  _setGradientColor() {
    let rects = this._segments.querySelectorAll('rect');
    for(let i = 0; i < 360; i++){
      let rect = rects[i];
      rect.setAttribute('fill',  this._deg2hsl(i + this._drawOffset));
    }
  }

  _render() {
    this.classList.add('spectrum-ColorWheel');

    let template = document.querySelector('#spectrum-ColorWheel');
    this.appendChild(template.content.cloneNode(true));

    this._segments = this.querySelector('.js-segments');

    for(let i = 0; i < 360; i++){
      let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      let height = 2;
      rect.setAttribute('width', 80);
      rect.setAttribute('height', height);
      rect.setAttribute('x', 80);
      rect.setAttribute('y', 80-height/2);
      rect.setAttribute('fill', this._deg2hsl(i + this._drawOffset));
      rect.setAttribute('transform', 'rotate('+i+' 80 80)');

      this._segments.appendChild(rect);
    }
  }

  constructor() {
    super();
    this._handleContainer = this.querySelector('.js-handleContainer');
    this._slider = this.querySelector('.js-slider');

    this._slider.addEventListener('change', e => {
      if (this._slider.value == 360) {
        this._slider.value = 0;
      }
      else if (this._slider.value == 0) {
        this._slider.value = 360;
      }

      this._chromaColor = this._chromaColor.set('hsl.h', this._slider.value);
      this._setValueFromChroma();

      e.stopPropagation();

      this.classList.add('is-focused');
    });
  }
}

customElements.define('spectrum-colorwheel', SpectrumColorWheel);




class SpectrumColorArea extends SpectrumColorControl {
  static get observedAttributes() {
    return ['size'].concat(SpectrumColorControl.observedAttributes);
  }

  _handleCoordinates = {
    x: 0,
    y: 0
  }

  _offsetCoordinates = {
    x: 0,
    y: 0
  }

  attributeChangedCallback(name, oldValue, newValue) {
    SpectrumColorControl.prototype.attributeChangedCallback.apply(this, arguments);
    switch (name) {
      case 'size':
        this.classList[this.size === 'small' ? 'add' : 'remove']('spectrum-ColorArea--small');
        break;
      case 'value':
        this._handleCoordinates.x = this._chromaColor.get('hsv.s') * this._rect.width;
        this._handleCoordinates.y = (1 - this._chromaColor.get('hsv.v')) * this._rect.height;

        this._handle.style.transform = `translate(${this._handleCoordinates.x}px, ${this._handleCoordinates.y}px)`;

        this._track.style.background = `
           linear-gradient(to top, black 0%, rgba(0, 0, 0, 0) 100%),
           linear-gradient(to right, white 0%, rgba(0, 0, 0, 0) 100%),
           hsl(${this._chromaColor.get('hsv.h')},100%,50%)
        `;

        this._handle.style.backgroundColor = this.value;
        this._sSlider.value = this._chromaColor.get('hsv.s');
        this._vSlider.value = this._chromaColor.get('hsv.v');
        break;
    }
  }

  get size() {
    return this.getAttribute('size');
  }

  set size(size) {
    this[size === 'small' ? 'setAttribute' : 'removeAttribute']('size', 'small');
  }

  _setValueFromCoordinates(coordinates) {
    var x = this._clamp(coordinates.x - this._offsetCoordinates.x, 0, this._rect.width);
    var y = this._clamp(coordinates.y - this._offsetCoordinates.y, 0, this._rect.height);

    // Don't let hue become NaN
    var h = this._chromaColor.get('hsv.h');
    if (!isNaN(h)) {
      this._h = h;
    }

    // Calculate SV
    var s = x / this._rect.width;
    var v = (this._rect.height - y) / this._rect.height;
    s = Math.round(s * 100) / 100;
    v = Math.round(v * 100) / 100;

    this._chromaColor = chroma({ h: this._h, s: s, v: v });

    this.value = `hsl(${this._h}, ${this._chromaColor.get('hsl.s') * 100}%, ${this._chromaColor.get('hsl.l') * 100}%)`;

    SpectrumColorControl.prototype._setValueFromCoordinates.apply(this, arguments);
  }

  _handleMouseDown(e) {
    SpectrumColorControl.prototype._handleMouseDown.apply(this, arguments);

    this._offsetCoordinates.x = this._coordinates.x - this._handleCoordinates.x;
    this._offsetCoordinates.y = this._coordinates.y - this._handleCoordinates.y;
  }

  _handleMouseUp(e) {
    SpectrumColorControl.prototype._handleMouseUp.apply(this, arguments);

    this._offsetCoordinates.x = 0;
    this._offsetCoordinates.y = 0;
  }

  _render() {
    this.classList.add('spectrum-ColorArea');

    let template = document.querySelector('#spectrum-ColorArea');
    this.appendChild(template.content.cloneNode(true));
  }

  constructor() {
    super();

    this._sSlider = this.querySelector('.js-sSlider');
    this._vSlider = this.querySelector('.js-vSlider');

    // Todo: move focus between sliders when up/down pressed?
    this._sSlider.addEventListener('change', e => {
      this._chromaColor = this._chromaColor.set('hsv.s', this._sSlider.value);
      this._setValueFromChroma();
    });

    this._vSlider.addEventListener('change', e => {
      this._chromaColor = this._chromaColor.set('hsv.v', this._vSlider.value);
      this._setValueFromChroma();
    });
  }
}

customElements.define('spectrum-colorarea', SpectrumColorArea);



class SpectrumColorSlider extends SpectrumColorControl {
  _handlePosition = 0
  _offset = 0

  _channel
  _channelMin
  _channelMax

  get mode() {
    return this.getAttribute('mode');
  }

  set mode(mode) {
    this.setAttribute('mode', mode);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    SpectrumColorControl.prototype.attributeChangedCallback.apply(this, arguments);

    switch (name) {
      case 'disabled':
        this._slider.disabled = this.disabled;
        break;

      case 'mode':
        this._setModeVariables();

        break;

      case 'value':
        this._setModeVariables();

        let startColor;
        let endColor;
        let rawValue;

        if (this.mode === 'a') {
          startColor = chroma(this.value).alpha(0);
          endColor = chroma(this.value).alpha(1);

          rawValue = this._chromaColor.alpha();
        }
        else {
          startColor = chroma(this.value).set(this._channel, this._channelMin);
          endColor = chroma(this.value).set(this._channel, this._channelMax);

          rawValue = (this._chromaColor.get(this._channel) / this._channelMax);
        }

        this._handlePosition = rawValue * this._rect.width;
        this._handle.style.transform = `translateX(${this._handlePosition}px)`;

        if (this.mode !== 'a') {
          endColor = endColor.alpha(1);
          startColor = startColor.alpha(1);
        }

        this._track.style.background = `
           linear-gradient(to right, ${startColor.css('rgba')} 0%, ${endColor.css('rgba')} 100%)
        `;

        this._handle.style.backgroundColor = this.value;
        this._slider.value = rawValue * this._channelMax;
        break;
    }
  }

  _setModeVariables() {
    switch (this.mode) {
      case 'h':
        this._channelMin = 0;
        this._channelMax = 359;
        this._channel = 'hsl.h';
        this._channelName = 'hue';
        break;
      case 's':
        this._channelMin = 0;
        this._channelMax = 1;
        this._channelStep = 0.01;
        this._channel = 'hsl.s';
        this._channelName = 'saturation';
        break;
      case 'v':
        this._channelMin = 0;
        this._channelMax = 1;
        this._channelStep = 0.01;
        this._channel = 'hsl.v';
        this._channelName = 'value';
        break;
      case 'l':
        this._channelMin = 0;
        this._channelMax = 1;
        this._channelStep = 0.01;
        this._channel = 'hsl.l';
        this._channelName = 'lightness';
        break;
      case 'r':
        this._channelMin = 0;
        this._channelMax = 255;
        this._channelStep = 1;
        this._channel = 'rgb.r';
        this._channelName = 'red';
        break;
      case 'g':
        this._channelMin = 0;
        this._channelMax = 255;
        this._channelStep = 1;
        this._channel = 'rgb.g';
        this._channelName = 'green';
        break;
      case 'b':
        this._channelMin = 0;
        this._channelMax = 255;
        this._channelStep = 1;
        this._channel = 'rgb.b';
        this._channelName = 'blue';
        break;
      case 'a':
        this._channelMin = 0;
        this._channelMax = 1;
        this._channelStep = 0.01;
        this._channel = 'rgba.a';
        this._channelName = 'alpha';
        break;
    }

    this._setSliderProperties();
  }

  _setSliderProperties() {
    this._slider.min = this._channelMin;
    this._slider.max = this._channelMax;
    this._slider.step = this._channelStep;
    this._slider.setAttribute('aria-label', this._channelName);
  }

  _setValueFromRawValue(rawValue) {
    // Transform color by mode
    switch (this.mode) {
      case 'h':
        this._chromaColor = this._chromaColor.set('hsl.h', this._channelMax * rawValue);
        break;
      case 's':
        this._chromaColor = this._chromaColor.set('hsl.s', this._channelMax * rawValue);
        break;
      case 'v':
        this._chromaColor = this._chromaColor.set('hsl.v', this._channelMax * rawValue);
        break;
      case 'l':
        this._chromaColor = this._chromaColor.set('hsl.l', this._channelMax * rawValue);
        break;
      case 'r':
        this._chromaColor = this._chromaColor.set('rgb.r', this._channelMax * rawValue);
        break;
      case 'g':
        this._chromaColor = this._chromaColor.set('rgb.g', this._channelMax * rawValue);
        break;
      case 'b':
        this._chromaColor = this._chromaColor.set('rgb.b', this._channelMax * rawValue);
        break;
      case 'a':
        this._chromaColor = this._chromaColor.alpha(rawValue);
        break;
    }

    // Get color in the colorspace of value
    this._setValueFromChroma();
    SpectrumColorControl.prototype._setValueFromCoordinates.apply(this, arguments);
  }

  _setValueFromCoordinates(coordinates) {
    var x = this._clamp(coordinates.x - this._offset, 0, this._rect.width);
    let rawValue = x / this._rect.width;

    this._setValueFromRawValue(rawValue);

    SpectrumColorControl.prototype._setValueFromCoordinates.apply(this, arguments);
  }

  _handleMouseDown(e) {
    SpectrumColorControl.prototype._handleMouseDown.apply(this, arguments);

    this._offset = this._coordinates.x - this._handlePosition;
  }

  _handleMouseUp(e) {
    SpectrumColorControl.prototype._handleMouseUp.apply(this, arguments);

    this._offset = 0;
  }

  _render() {
    this.classList.add('spectrum-ColorSlider');

    let template = document.querySelector('#spectrum-ColorSlider');
    this.appendChild(template.content.cloneNode(true));
  }

  constructor() {
    super();

    this._slider = this.querySelector('.js-slider');

    this._slider.addEventListener('change', e => {
      this._setValueFromRawValue(this._slider.value/this._channelMax);

      e.stopPropagation();

      this.classList.add('is-focused');
    });
  }
}

customElements.define('spectrum-colorslider', SpectrumColorSlider);


class SpectrumColorSliderGroup extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'value':
        this._sliders.forEach(slider => {
          slider.value = this.value;
        });
        break;
      case 'disabled':
        this._sliders.forEach(slider => {
          slider.disabled = this.disabled;
        });
        break;
    }
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  get disabled() {
    return this.getAttribute('disabled');
  }

  set disabled(disabled) {
    this[disabled ? 'setAttribute' : 'removeAttribute']('disabled', '');
  }

  constructor() {
    super();
    this.classList.add('spectrum-ColorSliderGroup');

    this._sliders = Array.prototype.slice.call(this.getElementsByTagName('spectrum-colorslider'));

    this.addEventListener('change', e => {
      this._sliders.forEach(slider => {
        if (slider !== e.target) {
          slider.value = e.target.value;
        }
      });
    });
  }
}

customElements.define('spectrum-colorslidergroup', SpectrumColorSliderGroup);


class SpectrumColorPicker extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'value':
        this._colorArea.value = this.value;
        this._colorWheel.value = this.value;
        break;
      case 'disabled':
        this._colorArea.disabled = this.disabled;
        this._colorWheel.disabled = this.disabled;
        break;
    }
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  get disabled() {
    return this.getAttribute('disabled');
  }

  set disabled(disabled) {
    this[disabled ? 'setAttribute' : 'removeAttribute']('disabled', '');
  }

  constructor() {
    super();
    this.classList.add('spectrum-ColorPicker');

    let template = document.querySelector('#spectrum-ColorPicker');
    this.appendChild(template.content.cloneNode(true));

    this._colorArea = this.querySelector('.js-colorArea');
    this._colorWheel = this.querySelector('.js-colorWheel');

    this._colorArea.addEventListener('change', e => {
      this._colorWheel.value = this._colorArea.value;
    });

    this._colorWheel.addEventListener('change', e => {
      this._colorArea.value = this._colorWheel.value;
    });
  }
}

customElements.define('spectrum-colorpicker', SpectrumColorPicker);
