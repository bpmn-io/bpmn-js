import inherits from 'inherits';

import ConnectionPreview from 'diagram-js/lib/features/connection-preview/ConnectionPreview';

/**
 * Shows connection preview.
 *
 * @param {didi.Injector} injector
 * @param {ElementFactory} elementFactory
 * @param {BpmnRules} bpmnRules
 */
export default function BpmnConnectionPreview(injector, elementFactory, bpmnRules) {
  injector.invoke(ConnectionPreview, this);

  this._elementFactory = elementFactory;
  this._bpmnRules = bpmnRules;
}

inherits(BpmnConnectionPreview, ConnectionPreview);

BpmnConnectionPreview.$inject = [
  'injector',
  'elementFactory',
  'bpmnRules'
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
BpmnConnectionPreview.prototype.getConnection = function(canConnect, source, target) {
  var attrs = canConnect;

  if (!attrs || !attrs.type) {
    attrs = this._bpmnRules.canConnect(source, target);
  }

  if (!attrs) {
    return;
  }

  return this._elementFactory.createConnection(attrs);
};