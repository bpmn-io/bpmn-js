import inherits from 'inherits';
import { is } from '../../util/ModelUtil';

import {
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import BpmnUpdater from '../modeling/BpmnUpdater';

/**
 * A handler responsible for updating the underlying BPMN 2.0 XML + DI
 * once changes on the diagram happen
 */
export default function MixedDiagramBpmnUpdater(injector, mixedDiagramSupport) {
  injector.invoke(BpmnUpdater, this);

  this._injector = injector;
  this._mixedDiagramSupport = mixedDiagramSupport;
}

inherits(MixedDiagramBpmnUpdater, BpmnUpdater);

MixedDiagramBpmnUpdater.$inject = [
  'injector',
  'mixedDiagramSupport'
];


// implementation //////////////////////
MixedDiagramBpmnUpdater.prototype.updateSemanticParent = function(
    businessObject, newParent, visualParent) {

  var children,
      containment = 'flowElements',
      topLevelProcess = this._mixedDiagramSupport.getTopLevelProcess();

  if (!shouldBeAddedToTopLevelProcess(businessObject, newParent, topLevelProcess)) {
    return BpmnUpdater.prototype.updateSemanticParent.apply(this, arguments);
  }

  // remove from old parent
  if (businessObject.$parent) {
    children = businessObject.$parent.get(containment);
    collectionRemove(children, businessObject);
  }

  // add to top level process
  children = topLevelProcess.get(containment);
  children.push(businessObject);
  businessObject.$parent = topLevelProcess;
};

function shouldBeAddedToTopLevelProcess(businessObject, newParent, topLevelProcess) {
  return (
    topLevelProcess &&
    is(businessObject, 'bpmn:FlowElement') &&
    is(newParent, 'bpmn:Collaboration') &&
    businessObject.$parent !== newParent
  );
}