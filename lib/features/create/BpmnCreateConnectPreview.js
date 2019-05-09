import inherits from 'inherits';

import CreateConnectPreview from 'diagram-js/lib/features/create/CreateConnectPreview';

/**
 * Shows connection preview during create.
 *
 * @param {Canvas} canvas
 * @param {BpmnRules} bpmnRules
 * @param {ElementFactory} elementFactory
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 * @param {didi.Injector} injector
 */
export default function BpmnCreateConnectPreview(
    bpmnRules,
    canvas,
    elementFactory,
    eventBus,
    graphicsFactory,
    injector
) {
  CreateConnectPreview.call(
    this,
    canvas,
    elementFactory,
    eventBus,
    graphicsFactory,
    injector
  );

  this._bpmnRules = bpmnRules;
}

inherits(BpmnCreateConnectPreview, CreateConnectPreview);

BpmnCreateConnectPreview.$inject = [
  'bpmnRules',
  'canvas',
  'elementFactory',
  'eventBus',
  'graphicsFactory',
  'injector'
];

/**
 * Get connection that connect source and target once connect is finished.
 *
 * @param {Object|boolean} canConnect
 * @param {djs.model.shape} source
 * @param {djs.model.shape} target
 *
 * @returns {djs.model.connection}
 */
BpmnCreateConnectPreview.prototype.getConnection = function(canConnect, source, target) {
  var attrs = canConnect;

  if (!attrs || !attrs.type) {
    attrs = this._bpmnRules.canConnect(source, target);
  }

  if (!attrs) {
    return;
  }

  return this._elementFactory.createConnection(attrs);
};