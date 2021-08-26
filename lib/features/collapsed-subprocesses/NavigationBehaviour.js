import inherits from 'inherits';

import { assign } from 'min-dash';
import { domify } from 'min-dom';
import { getBusinessObject, is } from '../../util/ModelUtil';



import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { selfAndAllChildren } from '../../../../diagram-js/lib/util/Elements';


var ARROW_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.81801948,3.50735931 L10.4996894,9.1896894 L10.5,4 L12,4 L12,12 L4,12 L4,10.5 L9.6896894,10.4996894 L3.75735931,4.56801948 C3.46446609,4.27512627 3.46446609,3.80025253 3.75735931,3.50735931 C4.05025253,3.21446609 4.52512627,3.21446609 4.81801948,3.50735931 Z"/></svg>';

export default function CollapsedProcesses(injector, eventBus, elementRegistry, overlays, canvas) {
  var breadcrumbs = domify('<ul class="breadcrumbs" style="position: absolute; top: 10px; left: 100px;"></ul>');

  injector.invoke(CommandInterceptor, this);

  assign(breadcrumbs.style, {
    fontFamily: 'Arial, sans-serif'
  });

  var container = canvas.getContainer();

  container.appendChild(breadcrumbs);

  eventBus.on('plane.set', function(event) {
    var plane = event.plane;

    updateBreadcrumbs(plane);
  });

  const updateBreadcrumbs = function(plane) {
    var parents = getParentChain(plane.rootElement);

    var path = parents.map(function(el, idx, array) {

      var separator = domify('<span>»</span>');

      assign(separator.style, {
        padding: '8px'
      });

      var html = domify(`<li><a>${el.name || el.id}</a></li>`);

      assign(html.style, {
        display: 'inline',
      });

      html.addEventListener('click', () => {
        if (elementRegistry.get(el.id + '_layer')) {
          canvas.setActivePlane(el.id);
        } else {
          var plane = canvas.findPlane(el.id);
          canvas.setActivePlane(plane);
        }
      });

      if (idx + 1 < array.length) {
        assign(html.style, {
          color: '#4d90ff',
          cursor: 'pointer'
        });
      }

      if (idx !== 0) {
        return [separator, html];
      }

      return [html];
    });

    breadcrumbs.innerHTML = '';
    breadcrumbs.append(...path.flat());
  };

  var overlayMap = {};

  var createOverlay = function(element) {
    if (overlayMap[element.id]) {
      console.log('old Overlay removed', overlayMap[element.id]);

      // New overlay, remove old one
      removeOverlay(element);
    }

    let html = document.createElement('button');

    assign(html.style, {
      padding: '0px',
      fontSize: '0',
      border: 'none',
      borderRadius: '2px',
      fill: 'white',
      outline: 'none',
      cursor: 'pointer',
      backgroundColor: '#4d90ff',
    });

    html.innerHTML = `${ARROW_DOWN_SVG}`;

    html.addEventListener('click', () => {
      canvas.setActivePlane(element.id);
    });


    overlayMap[element.id] = overlays.add(element, {
      position: {
        right: 0,
        bottom: 0
      },
      html
    });
  };

  var removeOverlay = function(element) {
    console.log('removeOverlay', element, overlayMap);
    if (overlayMap[element.id]) {
      overlays.remove(overlayMap[element.id]);
    }
  };

  var removeOverlays = function(elements) {
    elements.forEach(removeOverlay);
  };

  var addOverlays = (elements) => {
    elements.forEach(element => {
      if (element.type === 'bpmn:SubProcess' && element.collapsed) {
        createOverlay(element);
      }
    });
  };

  eventBus.on('import.done', function(context) {
    addOverlays(elementRegistry.getAll());
  });

  this.executed([ 'shape.toggleCollapse' ], function(event) {
    var shape = event.context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    if (shape.collapsed) {

      // Collapse
      removeOverlays(selfAndAllChildren(shape));
      createOverlay(shape);

      var plane = elementRegistry.get(shape.id + '_layer');
      addOverlays(selfAndAllChildren(plane));
    } else {

      // Expand
      addOverlays(selfAndAllChildren(shape));
      removeOverlay(shape);
    }
  });

  this.reverted([ 'shape.toggleCollapse' ], function(event) {
    var shape = event.context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    if (shape.collapsed) {
      createOverlay(shape);
    } else {
      removeOverlay(shape);
    }
  });

}

inherits(CollapsedProcesses, CommandInterceptor);


CollapsedProcesses.$inject = [ 'injector', 'eventBus', 'elementRegistry', 'overlays', 'canvas' ];


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
