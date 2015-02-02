'use strict';

function getLabelAttr(semantic) {
  if (semantic.$instanceOf('bpmn:FlowElement') ||
      semantic.$instanceOf('bpmn:Participant') ||
      semantic.$instanceOf('bpmn:Lane') ||
      semantic.$instanceOf('bpmn:SequenceFlow') ||
      semantic.$instanceOf('bpmn:MessageFlow')) {
    return 'name';
  }

  if (semantic.$instanceOf('bpmn:TextAnnotation')) {
    return 'text';
  }
}

module.exports.getLabel = function(element) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {
    return semantic[attr] || '';
  }
};


module.exports.setLabel = function(element, text) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {
    semantic[attr] = text;
  }

  var label = element.label || element;

  // show label
  label.hidden = false;

  return label;
};