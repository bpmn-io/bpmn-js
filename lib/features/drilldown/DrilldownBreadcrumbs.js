import { domify, classes } from 'min-dom';
import { find } from 'min-dash';

import { escapeHTML } from 'diagram-js/lib/util/EscapeUtil';
import { getBusinessObject, is } from '../../util/ModelUtil';
import {
  getPlaneIdFromShape
} from '../../util/DrilldownUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 *
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Shape} Shape
 */

var OPEN_CLASS = 'bjs-breadcrumbs-shown';


/**
 * Adds overlays that allow switching planes on collapsed subprocesses.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 */
export default function DrilldownBreadcrumbs(eventBus, elementRegistry, canvas) {
  var breadcrumbs = domify('<ul class="bjs-breadcrumbs"></ul>');
  var container = canvas.getContainer();
  var containerClasses = classes(container);
  container.appendChild(breadcrumbs);

  var businessObjectParents = [];

  // update breadcrumbs if name or ID of the primary shape changes
  eventBus.on('element.changed', function(event) {
    var shape = event.element,
        businessObject = getBusinessObject(shape);

    var isPresent = find(businessObjectParents, function(element) {
      return element === businessObject;
    });

    if (!isPresent) {
      return;
    }

    updateBreadcrumbs();
  });

  /**
   * Updates the displayed breadcrumbs. If no element is provided, only the
   * labels are updated.
   *
   * @param {Element} [element]
   */
  function updateBreadcrumbs(element) {
    if (element) {
      businessObjectParents = getBusinessObjectParentChain(element);
    }

    var path = businessObjectParents.flatMap(function(parent) {
      var parentPlane =
        canvas.findRoot(getPlaneIdFromShape(parent)) ||
        canvas.findRoot(parent.id);

      // when the root is a collaboration, the process does not have a
      // corresponding element in the elementRegisty. Instead, we search
      // for the corresponding participant
      if (!parentPlane && is(parent, 'bpmn:Process')) {
        var participant = elementRegistry.find(function(element) {
          var businessObject = getBusinessObject(element);

          return businessObject && businessObject.get('processRef') === parent;
        });

        parentPlane = participant && canvas.findRoot(participant.id);
      }

      if (!parentPlane) {
        return [];
      }

      var title = escapeHTML(parent.name || parent.id);
      var link = domify('<li><span class="bjs-crumb"><a title="' + title + '">' + title + '</a></span></li>');

      link.addEventListener('click', function() {
        canvas.setRootElement(parentPlane);
      });

      return link;
    });

    breadcrumbs.innerHTML = '';

    // show breadcrumbs and expose state to .djs-container
    var visible = path.length > 1;

    containerClasses.toggle(OPEN_CLASS, visible);

    path.forEach(function(element) {
      breadcrumbs.appendChild(element);
    });
  }

  eventBus.on('root.set', function(event) {
    updateBreadcrumbs(event.element);
  });

}

DrilldownBreadcrumbs.$inject = [ 'eventBus', 'elementRegistry', 'canvas' ];


// helpers //////////

/**
 * Returns the parents for the element using the business object chain,
 * starting with the root element.
 *
 * @param {Shape} child
 *
 * @return {Shape}
 */
function getBusinessObjectParentChain(child) {
  var businessObject = getBusinessObject(child);

  var parents = [];

  for (var element = businessObject; element; element = element.$parent) {
    if (is(element, 'bpmn:SubProcess') || is(element, 'bpmn:Process')) {
      parents.push(element);
    }
  }

  return parents.reverse();
}