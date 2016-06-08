var AutoResize = require('diagram-js/lib/features/auto-resize/AutoResize');

var inherits = require('inherits');

var is = require('../../util/ModelUtil').is;

/**
 * Sub class of the AutoResize module which implements a BPMN
 * specific resize function.
 */
function BpmnAutoResize(eventBus, elementRegistry, modeling, rules) {
  AutoResize.call(this, eventBus, elementRegistry, modeling, rules);
}

BpmnAutoResize.$inject = [ 'eventBus', 'elementRegistry', 'modeling', 'rules' ];

inherits(BpmnAutoResize, AutoResize);

module.exports = BpmnAutoResize;


/**
 * Resize shapes and lanes
 *
 * @param  {djs.model.Shape} target
 * @param  {Object} newBounds
 */
BpmnAutoResize.prototype.resize = function(target, newBounds) {

  if (is(target, 'bpmn:Participant')) {
    this._modeling.resizeLane(target, newBounds);
  } else {
    this._modeling.resizeShape(target, newBounds);
  }
};