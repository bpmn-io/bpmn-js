import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import inherits from 'inherits';

import cssEscape from 'css.escape';

import {
  assign,
  forEach
} from 'min-dash';

import {
  query as domQuery
} from 'min-dom';

import {
  attr as svgAttr
} from 'tiny-svg';

var LOW_PRIORITY = 250;


export default function BpmnReplacePreview(
    eventBus, elementRegistry, elementFactory,
    canvas, previewSupport) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Replace the visuals of all elements in the context which can be replaced
   *
   * @param  {Object} context
   */
  function replaceVisual(context) {

    var replacements = context.canExecute.replacements;

    forEach(replacements, function(replacement) {

      var id = replacement.oldElementId;

      var newElement = {
        type: replacement.newElementType
      };

      // if the visual of the element is already replaced
      if (context.visualReplacements[id]) {
        return;
      }

      var element = elementRegistry.get(id);

      assign(newElement, { x: element.x, y: element.y });

      // create a temporary shape
      var tempShape = elementFactory.createShape(newElement);

      canvas.addShape(tempShape, element.parent);

      // select the original SVG element related to the element and hide it
      var gfx = domQuery('[data-element-id="' + cssEscape(element.id) + '"]', context.dragGroup);

      if (gfx) {
        svgAttr(gfx, { display: 'none' });
      }

      // clone the gfx of the temporary shape and add it to the drag group
      var dragger = previewSupport.addDragger(tempShape, context.dragGroup);

      context.visualReplacements[id] = dragger;

      canvas.removeShape(tempShape);
    });
  }

  /**
   * Restore the original visuals of the previously replaced elements
   *
   * @param  {Object} context
   */
  function restoreVisual(context) {

    var visualReplacements = context.visualReplacements;

    forEach(visualReplacements, function(dragger, id) {

      var originalGfx = domQuery('[data-element-id="' + cssEscape(id) + '"]', context.dragGroup);

      if (originalGfx) {
        svgAttr(originalGfx, { display: 'inline' });
      }

      dragger.remove();

      if (visualReplacements[id]) {
        delete visualReplacements[id];
      }
    });
  }

  eventBus.on('shape.move.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        canExecute = context.canExecute;

    if (!context.visualReplacements) {
      context.visualReplacements = {};
    }

    if (canExecute.replacements) {
      replaceVisual(context);
    } else {
      restoreVisual(context);
    }
  });
}

BpmnReplacePreview.$inject = [
  'eventBus',
  'elementRegistry',
  'elementFactory',
  'canvas',
  'previewSupport'
];

inherits(BpmnReplacePreview, CommandInterceptor);