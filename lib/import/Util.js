export function elementToString(e) {
  if (!e) {
    return '<null>';
  }

  return '<' + e.$type + (e.id ? ' id="' + e.id : '') + '" />';
}

export function applyStyles(el, styles) {
  Object.keys(styles).forEach(function(key) {
    el.style[key] = styles[key];
  });
}
