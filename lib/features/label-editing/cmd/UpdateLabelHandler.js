'use strict';

var LabelUtil = require('../LabelUtil');

var TextUtil = require('diagram-js/lib/util/Text');

var hasExternalLabel = require('../../../util/LabelUtil').hasExternalLabel;

var getBusinessObject = require('../../../util/ModelUtil').getBusinessObject,
    is = require('../../../util/ModelUtil').is;

var NULL_DIMENSIONS = {
  width: 0,
  height: 0
};


/**
 * A handler that updates the text of a BPMN element.
 */
function UpdateLabelHandler(modeling) {

  var textUtil = new TextUtil();

  /**
   * Set the label and return the changed elements.
   *
   * Element parameter can be label itself or connection (i.e. sequence flow).
   *
   * @param {djs.model.Base} element
   * @param {String} text
   */
  function setText(element, text) {

    // external label if present
    var label = element.label || element;

    var labelTarget = element.labelTarget || element;

    LabelUtil.setLabel(label, text, labelTarget !== label);

    return [ label, labelTarget ];
  }

  function execute(ctx) {
    ctx.oldLabel = LabelUtil.getLabel(ctx.element);
    return setText(ctx.element, ctx.newLabel);
  }

  function revert(ctx) {
    return setText(ctx.element, ctx.oldLabel);
  }

  function postExecute(ctx) {
    var element = ctx.element,
        label = element.label || element,
        bounds = ctx.bounds;

    // ignore internal labels for elements except text annotations
    if (!hasExternalLabel(element) && !is(element, 'bpmn:TextAnnotation')) {
      return;
    }

    var bo = getBusinessObject(label);

    var text = bo.name || bo.text;

    if (!text) {
      return;
    }

    // get layouted text bounds and resize external
    // external label accordingly
    var newBounds = is(element, 'bpmn:TextAnnotation') ? bounds : getLayoutedBounds(label, text, textUtil);

    modeling.resizeShape(label, newBounds, NULL_DIMENSIONS);
  }

  // API

  this.execute = execute;
  this.revert = revert;
  this.postExecute = postExecute;
}

UpdateLabelHandler.$inject = [ 'modeling' ];

module.exports = UpdateLabelHandler;


// TODO(nikku): repeating code (search for <getLayoutedBounds>)

var EXTERNAL_LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '11px'
};

function getLayoutedBounds(bounds, text, textUtil) {

  var layoutedLabelDimensions = textUtil.getDimensions(text, {
    box: {
      width: 90,
      height: 30,
      x: bounds.width / 2 + bounds.x,
      y: bounds.height / 2 + bounds.y
    },
    style: EXTERNAL_LABEL_STYLE
  });

  // resize label shape to fit label text
  return {
    x: Math.round(bounds.x + bounds.width / 2 - layoutedLabelDimensions.width / 2),
    y: Math.round(bounds.y),
    width: Math.ceil(layoutedLabelDimensions.width),
    height: Math.ceil(layoutedLabelDimensions.height)
  };
}