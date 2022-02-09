import { domify, classes } from 'min-dom';
import { find } from 'min-dash';

import { escapeHTML } from 'diagram-js/lib/util/EscapeUtil';
import { getBusinessObject, is } from '../../util/ModelUtil';
import {
  getPlaneIdFromShape
} from '../../util/DrilldownUtil';

var OPEN_CLASS = 'bjs-breadcrumbs-shown';


/**
 * Adds overlays that allow switching planes on collapsed subprocesses.
 *
 * @param {eventBus} eventBus
 * @param {elementRegistry} elementRegistry
 * @param {overlays} overlays
 * @param {canvas} canvas
 */
export default function DrilldownBreadcrumbs(eventBus, elementRegistry, overlays, canvas) {
  var breadcrumbs = domify('<ul class="bjs-breadcrumbs"></ul>');
  var container = canvas.getContainer();
  var containerClasses = classes(container);
  container.appendChild(breadcrumbs);

  var boParents = [];

  // update breadcrumbs if name or ID of the primary shape changes
  eventBus.on('element.changed', function(e) {
    var shape = e.element,
        bo = getBusinessObject(shape);

    var isPresent = find(boParents, function(el) {
      return el === bo;
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
   * @param {djs.model.Base} [element]
   */
  function updateBreadcrumbs(element) {
    if (element) {
      boParents = getBoParentChain(element);
    }

    var path = boParents.map(function(parent) {
      var title = escapeHTML(parent.name || parent.id);
      var link = domify('<li><span class="bjs-crumb"><a title="' + title + '">' + title + '</a></span></li>');

      var parentPlane = canvas.findRoot(getPlaneIdFromShape(parent)) || canvas.findRoot(parent.id);

      // when the root is a collaboration, the process does not have a corresponding
      // element in the elementRegisty. Instead, we search for the corresponding participant
      if (!parentPlane && is(parent, 'bpmn:Process')) {
        var participant = elementRegistry.find(function(element) {
          var bo = getBusinessObject(element);
          return bo && bo.processRef && bo.processRef === parent;
        });

        parentPlane = canvas.findRoot(participant.id);
      }

      link.addEventListener('click', function() {
        canvas.setRootElement(parentPlane);
      });

      return link;
    });

    breadcrumbs.innerHTML = '';

    // show breadcrumbs and expose state to .djs-container
    var visible = path.length > 1;
    containerClasses.toggle(OPEN_CLASS, visible);

    path.forEach(function(el) {
      breadcrumbs.appendChild(el);
    });
  }

  eventBus.on('root.set', function(event) {
    updateBreadcrumbs(event.element);
  });

}

DrilldownBreadcrumbs.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'canvas' ];


// helpers //////////

/**
 * Returns the parents for the element using the business object chain,
 * starting with the root element.
 *
 * @param {djs.model.Shape} child
 *
 * @returns {Array<djs.model.Shape>} parents
 */
function getBoParentChain(child) {
  var bo = getBusinessObject(child);

  var parents = [];

  for (var element = bo; element; element = element.$parent) {
    if (is(element, 'bpmn:SubProcess') || is(element, 'bpmn:Process')) {
      parents.push(element);
    }
  }

  return parents.reverse();
}