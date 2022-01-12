import { domify, classes } from 'min-dom';

import { escapeHTML } from 'diagram-js/lib/util/EscapeUtil';
import { getBusinessObject, is } from '../../util/ModelUtil';
import { planeId } from '../../util/DrilldownUtil';

var OPEN_CLASS = 'bjs-breadcrumbs-shown';


/**
 * Adds Overlays that allow switching planes on collapsed subprocesses.
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

  function updateBreadcrumbs(currentRoot) {
    var parents = getParentChain(currentRoot);

    var path = parents.map(function(parent) {
      var title = escapeHTML(parent.name || parent.id);
      var link = domify('<li><span class="bjs-crumb"><a title="' + title + '">' + title + '</a></span></li>');

      var parentPlane = canvas.findRoot(planeId(parent)) || canvas.findRoot(parent.id);

      if (!parentPlane && is(parent, 'bpmn:Process')) {

        // root is a collaboration
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


// helpers
function getParentChain(child) {
  var bo = getBusinessObject(child);

  var parents = [];

  for (var element = bo; element; element = element.$parent) {
    if (is(element, 'bpmn:SubProcess') || is(element, 'bpmn:Process')) {
      parents.push(element);
    }
  }

  return parents.reverse();
}