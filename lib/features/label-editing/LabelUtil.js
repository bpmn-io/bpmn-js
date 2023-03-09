import { is } from '../../util/ModelUtil';

/**
 * @typedef { import('../../model').DiagramElement } DiagramElement
 */

function getLabelAttr(semantic) {
  if (
    is(semantic, 'bpmn:FlowElement') ||
    is(semantic, 'bpmn:Participant') ||
    is(semantic, 'bpmn:Lane') ||
    is(semantic, 'bpmn:SequenceFlow') ||
    is(semantic, 'bpmn:MessageFlow') ||
    is(semantic, 'bpmn:DataInput') ||
    is(semantic, 'bpmn:DataOutput')
  ) {
    return 'name';
  }

  if (is(semantic, 'bpmn:TextAnnotation')) {
    return 'text';
  }

  if (is(semantic, 'bpmn:Group')) {
    return 'categoryValueRef';
  }
}

function getCategoryValue(semantic) {
  var categoryValueRef = semantic['categoryValueRef'];

  if (!categoryValueRef) {
    return '';
  }


  return categoryValueRef.value || '';
}

/**
 * @param {DiagramElement} element
 *
 * @return {string} label
 */
export function getLabel(element) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {

    if (attr === 'categoryValueRef') {

      return getCategoryValue(semantic);
    }

    return semantic[attr] || '';
  }
}


/**
 * @param {DiagramElement} element
 * @param {string} text
 *
 * @return {DiagramElement} element
 */
export function setLabel(element, text) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {

    if (attr === 'categoryValueRef') {
      semantic['categoryValueRef'].value = text;
    } else {
      semantic[attr] = text;
    }

  }

  return element;
}