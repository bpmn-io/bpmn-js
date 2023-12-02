export function elementToString(element) {
  if (!element) {
    return '<null>';
  }

  if (element.id) {
    return `<${ element.$type } id="${ element.id }" />`;
  }

  return `<${ element.$type } />`;
}