import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getBBox, getEnclosedElements } from 'diagram-js/lib/util/Elements';

import {
  is
} from '../../../util/ModelUtil';

import { filter, forEach, values } from 'min-dash';


/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('../Modeling').default} Modeling
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../../model/Types').Element} Element
 */

var HIGH_PRIORITY = 1500;

/**
 * A behavior that ensures that visually enclosed artifacts are affected
 * by container element behavior:
 *
 *  * removed when the container is removed
 *  * moved when the container is moved
 *
 * @param {Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Modeling} modeling
 */
export default function ArtifactBehavior(
    injector,
    eventBus,
    canvas,
    modeling
) {
  injector.invoke(CommandInterceptor, this);

  // enclosed artifacts are deleted with a container element
  this.preExecute('elements.delete', HIGH_PRIORITY, function(event) {
    var context = event.context,
        elements = context.elements;

    var enclosedArtifacts = getEnclosedArtifacts(elements);

    if (enclosedArtifacts.length) {
      modeling.removeElements(enclosedArtifacts);
    }
  });

  // enclosed artifacts are moved with container element
  eventBus.on('shape.move.start', function(event) {

    var shapes = event.context.shapes;

    var enclosedArtifacts = getEnclosedArtifacts(shapes);

    if (enclosedArtifacts.length) {
      event.context.shapes = shapes.concat(enclosedArtifacts);
    }
  });


  /**
   * @param { Element[] } elements
   *
   * @return { Element[] }
   */
  function getEnclosedArtifacts(elements) {

    var containerElements = filter(
      elements, e => is(e, 'bpmn:Participant') || is(e, 'bpmn:SubProcess')
    );

    if (!containerElements.length) {
      return [];
    }

    var canvasRoot = canvas.getRootElement();

    // artifacts that still need to be checked for being enclosed
    var remainingArtifacts = new Set(canvasRoot.children.filter(
      (child) => is(child, 'bpmn:Artifact')
    ));

    // artifacts that are definitely enclosed
    var enclosedArtifacts = new Set();

    // we need to verify for all container elements, all artifacts <m:n>
    forEach(containerElements, containerElement => {
      const newEnclosedArtifacts = new Set(values(
        getEnclosedElements(
          Array.from(remainingArtifacts),
          getBBox(containerElement)
        )
      ));

      enclosedArtifacts = enclosedArtifacts.union(newEnclosedArtifacts);
      remainingArtifacts = remainingArtifacts.difference(newEnclosedArtifacts);
    });

    return Array.from(enclosedArtifacts);
  }

}

inherits(ArtifactBehavior, CommandInterceptor);

ArtifactBehavior.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'modeling'
];