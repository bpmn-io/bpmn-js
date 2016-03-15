'use strict';

var LabelUtil = require('../LabelUtil');
var is = require('../../../util/ModelUtil').is;


/**
 * A handler that updates the text of a BPMN element.
 */
function UpdateLabelHandler(modeling) {
  this._modeling = modeling;

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
    if (ctx.newBounds){

      // resize textannotation to size of textarea
      if(is(ctx.element, 'bpmn:TextAnnotation')){
        return modeling.resizeShape(ctx.element, ctx.newBounds);
      }

      // resize external labels
      if( ctx.element.label || ctx.element.type === 'label'){
        var target = ctx.element.type === 'label' ? ctx.element : ctx.element.label;

        return modeling.resizeShape(target, ctx.newBounds);
      }

    }
  }

  // API
  this.execute = execute;
  this.revert = revert;
  this.postExecute = postExecute;
}

UpdateLabelHandler.$inject = [ 'modeling' ];

module.exports = UpdateLabelHandler;
