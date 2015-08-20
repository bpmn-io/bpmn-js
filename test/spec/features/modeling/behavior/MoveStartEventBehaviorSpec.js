'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var replacePreviewModule = require('../../../../../lib/features/replace-preview'),
    modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var is = require('../../../../../lib/util/ModelUtil').is,
    Events = require('diagram-js/test/util/Events');

describe('features/modeling - move start event behavior', function() {

  var testModules = [ replacePreviewModule, modelingModule, coreModule ];

  var diagramXML = require('../../../../fixtures/bpmn/event-sub-processes.bpmn');

  var Event,
      moveShape;

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  beforeEach(inject(function(canvas, move, dragging, elementRegistry) {
    Event = Events.target(canvas._svg);

    moveShape = function(shape, target, position) {
      var startPosition = { x: shape.x + 10 + shape.width / 2, y: shape.y + 30 + shape.height/2 };

      move.start(Event.create(startPosition), shape);

      dragging.hover({
        element: target,
        gfx: elementRegistry.getGraphics(target)
      });

      dragging.move(Event.create(position));
    };
  }));


  it('should select the replacement after replacing the start event',
    inject(function(elementRegistry, canvas, dragging, move, selection) {

    // given
    var startEvent = elementRegistry.get('StartEvent_1'),
        rootElement = canvas.getRootElement();

    // when
    moveShape(startEvent, rootElement, { x: 140, y: 250 });

    dragging.end();

    var replacement = elementRegistry.filter(function(element) {
      if(is(element, 'bpmn:StartEvent') && element.parent === rootElement) {
        return true;
      }
    })[0];

    // then
    expect(selection.get()).to.include(replacement);
    expect(selection.get()).not.to.include(startEvent);

  }));


  it('should select all moved shapes after some of them got replaced',
    inject(function(elementRegistry, canvas, dragging, move, selection) {

    // given
    var startEvent1 = elementRegistry.get('StartEvent_1'),
        startEvent2 = elementRegistry.get('StartEvent_2'),
        startEvent3 = elementRegistry.get('StartEvent_3'),
        rootElement = canvas.getRootElement();

    // when
    selection.select([ startEvent1, startEvent2, startEvent3 ]);
    moveShape(startEvent1, rootElement, { x: 140, y: 250 });

    dragging.end();

    var replacements = elementRegistry.filter(function(element) {
      if(is(element, 'bpmn:StartEvent') && element.type !== 'label') {
        return true;
      }
    });

    // then
    expect(selection.get()).to.include(replacements[0]);
    expect(selection.get()).to.include(replacements[1]);
    expect(selection.get()).to.include(replacements[2]);

  }));

});
