
function createHtmlElement({
  element,
  id,
  className,
  title,
  styles,
  type,
  innerHTML,
  attributes,
  eventListeners,
  appendTo
}) {
  const el = document.createElement(element);
  if(id) el.id = id;
  if(className) el.className = className;
  if(styles) {
    for (const [prop, value] of Object.entries(styles)) {
      el.style[prop] = value;
    }
  }
  if(type) el.type = type;
  if(innerHTML) el.innerHTML = innerHTML;
  if(attributes) {
    for (const [prop, value] of Object.entries(attributes)) {
      el.setAttribute(prop, value)
    }
  }
  if(title) el.title = title;
  if(eventListeners) {
    for (const [event, func] of Object.entries(eventListeners)) {
      el.addEventListener(event, func)
    }
  }
  const dest = document.getElementById(appendTo);
  dest.appendChild(el);
}

function createSVGelement({
  element,
  id,
  className,
  attributes,
  textContent,
  appendTo
}) {
  const svgns = "http://www.w3.org/2000/svg";
  const el = document.createElementNS(svgns, element);
  if(id) el.id = id;
  if(className) el.className = className;
  if(styles) {
    for (const [prop, value] of Object.entries(styles)) {
      el.style[prop] = value;
    }
  }
  if(attributes) {
    for (const [prop, value] of Object.entries(attributes)) {
      el.setAttributeNS( null, prop, value );
    }
  }
  if(textContent) el.textContent = textContent;
  const dest = document.getElementById(appendTo);
  dest.appendChild(el);
}