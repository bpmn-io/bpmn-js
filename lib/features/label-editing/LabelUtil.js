'use strict';

var is = require('../../util/ModelUtil').is;

function getLabelAttr(semantic) {
  if (is(semantic, 'bpmn:FlowElement') ||
      is(semantic, 'bpmn:Participant') ||
      is(semantic, 'bpmn:Lane') ||
      is(semantic, 'bpmn:SequenceFlow') ||
      is(semantic, 'bpmn:MessageFlow')) {

    return 'name';
  }

  if (is(semantic, 'bpmn:TextAnnotation')) {
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


module.exports.setLabel = function(element, text, isExternal) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {
    semantic[attr] = text;
  }

  // show external label if not empty
  if (isExternal) {
    element.hidden = !text;
  }

  return element;
};