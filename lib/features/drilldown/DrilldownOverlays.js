import { domify } from 'min-dom';

import { escapeHTML } from 'diagram-js/lib/util/EscapeUtil';
import { getBusinessObject, is } from '../../util/ModelUtil';

var ARROW_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.81801948,3.50735931 L10.4996894,9.1896894 L10.5,4 L12,4 L12,12 L4,12 L4,10.5 L9.6896894,10.4996894 L3.75735931,4.56801948 C3.46446609,4.27512627 3.46446609,3.80025253 3.75735931,3.50735931 C4.05025253,3.21446609 4.52512627,3.21446609 4.81801948,3.50735931 Z"/></svg>';

/**
 * Adds Overlays that allow switching planes on collapsed subprocesses.
 *
 * @param {eventBus} eventBus
 * @param {elementRegistry} elementRegistry
 * @param {overlays} overlays
 * @param {canvas} canvas
 */
export default function DrilldownOverlays(eventBus, elementRegistry, overlays, canvas) {
  var breadcrumbs = domify('<ul class="bjs-breadcrumbs djs-element-hidden"></ul>');
  var container = canvas.getContainer();
  container.appendChild(breadcrumbs);

  function updateBreadcrumbs(plane) {
    var subProcess = elementRegistry.get(plane.name);
    var parents = getParentChain(subProcess);

    var path = parents.map(function(el) {
      var title = escapeHTML(el.name || el.id);
      var link = domify('<li><span class="bjs-crumb"><a title="' + title + '">' + title + '</a></span></li>');

      link.addEventListener('click', function() {
        if (canvas.getPlane(el.id)) {
          canvas.setActivePlane(el.id);
        } else {
          var plane = canvas.findPlane(el.id);
          canvas.setActivePlane(plane);
        }
      });

      return link;
    });

    breadcrumbs.innerHTML = '';

    if (path.length > 1) {
      breadcrumbs.classList.remove('djs-element-hidden');
    } else {
      breadcrumbs.classList.add('djs-element-hidden');
    }

    path.forEach(function(el) {
      breadcrumbs.appendChild(el);
    });
  }

  eventBus.on('plane.set', function(event) {
    var plane = event.plane;

    updateBreadcrumbs(plane);
  });

  var createOverlay = function(element) {
    var html = domify('<button class="bjs-drilldown">' + ARROW_DOWN_SVG + '</button>');

    html.addEventListener('click', function() {
      canvas.setActivePlane(element.id);
    });

    overlays.add(element, {
      position: {
        bottom: -7,
        right: -8
      },
      html: html
    });
  };

  var addOverlays = function(elements) {
    elements.forEach(function(element) {
      if (is(element, 'bpmn:SubProcess')
          && element.collapsed
          && canvas.getPlane(element.id)) {
        createOverlay(element);
      }
    });
  };

  eventBus.on('import.done', function() {
    addOverlays(elementRegistry.filter(function(el) {
      return is(el, 'bpmn:SubProcess');
    }));
  });
}

DrilldownOverlays.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'canvas' ];


// helpers
var getParentChain = function(child) {
  var bo = getBusinessObject(child);

  var parents = [];

  for (var element = bo; element; element = element.$parent) {
    if (is(element, 'bpmn:SubProcess') || is(element, 'bpmn:Process')) {
      parents.push(element);
    }
  }

  return parents.reverse();
};
