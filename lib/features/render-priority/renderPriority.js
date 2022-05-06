import { selfAndAllChildren } from 'diagram-js/lib/util/Elements';
import { getPlaneIdFromShape, getShapeIdFromPlane, isPlane } from '../../util/DrilldownUtil';
import { is } from '../../util/ModelUtil';

const HIGH_PRIORITY = 1500;

/**
 * A plugin hides the Canvas below a loading spinner while rendering is happening.
 */
export default function RenderPriority(
    eventBus, scheduler, elementRegistry) {

  this._eventBus = eventBus;
  this._scheduler = scheduler;
  this._elementRegistry = elementRegistry;
  var self = this;
  eventBus.on('root.set', function(e) {
    const root = e.element;

    self.handleChildren(root);
    self.handleParents(root);
  });
}

RenderPriority.prototype.handleChildren = function(root, priority = HIGH_PRIORITY) {
  var elementRegistry = this._elementRegistry;
  console.log('handleChildren', root, priority);

  var children = selfAndAllChildren(root);
  var self = this;

  const childPlanes = children
    .filter(child => is(child, 'bpmn:SubProcess'))
    .map(child => elementRegistry.get(getPlaneIdFromShape(child)))
    .filter(child => !!child);

  console.log(childPlanes);

  childPlanes.forEach(childPlane => {

    self.scheduleRootElement(childPlane, priority);
    self.handleChildren(childPlane, priority--);
  });
};

RenderPriority.prototype.handleParents = function(root, priority = HIGH_PRIORITY) {
  var elementRegistry = this._elementRegistry;

  if (!root || !isPlane(root)) {
    return;
  }

  var parent = elementRegistry.get(getShapeIdFromPlane(root));

  if (!parent || parent === root) {
    return;
  }

  this.scheduleRootElement(parent, priority--);
  this.handleParents(parent, priority--);

};

RenderPriority.prototype.scheduleRootElement = function(root, priority) {
  var scheduler = this._scheduler;

  console.log('schedule', root, priority);


  selfAndAllChildren(root).forEach(function(element) {
    scheduler.changePriority(element.id, priority);
  });
};

RenderPriority.$inject = [
  'eventBus',
  'scheduler',
  'elementRegistry'
];
