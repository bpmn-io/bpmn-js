import { getDi } from '../../util/ModelUtil';

import {
  filter,
  forEach,
  map
} from 'min-dash';

import { selfAndAllChildren } from 'diagram-js/lib/util/Elements';


var HIGH_PRIORITY = 2000;

export default function BpmnDiOrdering(eventBus, canvas) {

  eventBus.on('saveXML.start', HIGH_PRIORITY, orderDi);

  function orderDi() {
    var rootElements = canvas.getRootElements();

    forEach(rootElements, function(root) {
      var rootDi = getDi(root),
          elements,
          diElements;

      elements = selfAndAllChildren([ root ], false);

      // only bpmndi:Shape and bpmndi:Edge can be direct children of bpmndi:Plane
      elements = filter(elements, function(element) {
        return element !== root && !element.labelTarget;
      });

      diElements = map(elements, getDi);

      rootDi.set('planeElement', diElements);
    });
  }
}

BpmnDiOrdering.$inject = [ 'eventBus', 'canvas' ];
