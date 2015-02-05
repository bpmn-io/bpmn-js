'use strict';

var _ = require('lodash');

var LabelUtil = require('../label-editing/LabelUtil'),
    BaseReplace = require('diagram-js/lib/features/replace/Replace');

function BpmnReplace(modeling, eventBus) {

  BaseReplace.call(this, modeling);

  this._originalReplaceElement = BaseReplace.prototype.replaceElement;

  this._modeling = modeling;

  eventBus.on([
    'commandStack.shape.replace.postExecute'
  ], function(event) {

    var context = event.context,
        oldShape = context.oldShape,
        newShape = context.newShape,
        newBusinessAtt = context.options ? context.options.newBusinessAtt || {} : {};

    _.assign(newShape.businessObject, newBusinessAtt);
    modeling.updateLabel(newShape, LabelUtil.getLabel(oldShape));
  });

  // TODO(nre): update bpmn specific properties based on our meta-model
  //            i.e. we should not only keep the name, but also
  //            other properties that exist in BOTH the old and new shape
}

module.exports = BpmnReplace;

BpmnReplace.$inject = [ 'modeling', 'eventBus' ];

BpmnReplace.prototype = Object.create(BaseReplace.prototype);

BpmnReplace.prototype.replaceElement = function(oldElement, newElementData, newBusinessAtt) {

  if (oldElement.waypoints) {
    throw new Error('connections cannot be replaced (yet)');
  }

  // use old elements size for activities
  // TODO(nre): may also specify do this during the replace suggestions
  //       already (i.e. replace suggestions = { type, label, newElementData }) (?)
  if (oldElement.businessObject.$instanceOf('bpmn:Activity')) {

    // TODO need also to respect min/max Size
    newElementData.width = oldElement.width;
    newElementData.height = oldElement.height;
  }

  return this._originalReplaceElement(oldElement, newElementData, {newBusinessAtt: newBusinessAtt});
};
