'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var autoResizeModule = require('../../../../lib/features/auto-resize'),
    modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('diagram-js/lib/features/create'),
    coreModule = require('../../../../lib/core'),
    canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

function getBounds(shape) {
  return pick(shape, [ 'x', 'y', 'width', 'height' ]);
}


describe('features/auto-resize', function() {

  var testModules = [ coreModule, modelingModule, autoResizeModule, createModule ];


  describe('participant', function() {

    var diagramXML = require('./AutoResize.participant.bpmn');

    var task,
        participant,
        startEvent,
        originalBounds;

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    beforeEach(inject(function(elementRegistry) {

      task = elementRegistry.get('Task_1');
      participant = elementRegistry.get('Participant_1');
      startEvent = elementRegistry.get('StartEvent_1');

      originalBounds = getBounds(participant);

      expect(originalBounds).to.eql({ x: 247, y: 160, width: 371, height: 178 });

    }));


    describe('after moving', function() {

      it('should expand the right edge',
          inject(function(modeling) {

        // when
        modeling.moveElements([ task ], { x: 100, y: 0 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { width: 525 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should expand the top edge', inject(function(modeling) {

        // when
        modeling.moveElements([ task ], { x: 0, y: -50 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { y: 99, height: 239 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should expand the bottom edge', inject(function(modeling) {

        // when
        modeling.moveElements([ task ], { x: 0, y: 50 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { height: 239 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should expand the left edge', inject(function(modeling) {

        // when
        modeling.moveElements([ startEvent ], { x: -100, y: 0 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { x: 122, width: 496 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should expand the bottom right edges', inject(function(modeling) {

        // when
        modeling.moveElements([ task ], { x: 50, y: 50 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { width: 475, height: 239 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should expand the top left edges', inject(function(modeling) {

        // when
        modeling.moveElements([ startEvent ], { x: -100, y: -100 }, participant);

        // then
        expect(participant).to.have.bounds({ x: 122, y: 71, width: 496, height: 267 });
      }));


      it('should resize the parent if element and parent edge intersect',
          inject(function(modeling) {

        // when
        modeling.moveElements([ task ], { x: 0, y: 49 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { height: 238 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should not resize the parent if element is placed near the bottom',
          inject(function(modeling) {

        // when
        modeling.moveElements([ task ], { x: 0, y: 47 }, participant);

        // then
        expect(participant).to.have.bounds(originalBounds);
      }));


      it('should undo resizing', inject(function(modeling, commandStack) {

        // when
        modeling.moveElements([ startEvent ], { x: -100, y: -100 }, participant);
        commandStack.undo();

        // then
        expect(participant).to.have.bounds(originalBounds);
      }));


      it('should redo resizing', inject(function(modeling, commandStack) {

        // when
        modeling.moveElements([ startEvent ], { x: -100, y: -100 }, participant);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(participant).to.have.bounds({ x: 122, y: 71, width: 496, height: 267 });
      }));

    });

    describe('after moving multiple elements', function() {

      it('should expand the right edge', inject(function(modeling, selection) {

        // when
        modeling.moveElements([ task, startEvent ], { x: 200, y: 0 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { width: 625 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should expand the bottom edge', inject(function(modeling, selection) {

        // when
        modeling.moveElements([ task, startEvent ], { x: 0, y: 48 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { height: 237 });

        expect(participant).to.have.bounds(expectedBounds);
      }));

    });


    describe('after appending', function(){

      it('should expand the bottom right edges', inject(function(modeling) {

        // when
        modeling.appendShape(task, { type: 'bpmn:Task' }, { x: 660, y: 350 }, participant);

        // then
        var expectedBounds = assign(originalBounds, { width: 563, height: 290 });

        expect(participant).to.have.bounds(expectedBounds);
      }));


      it('should undo resizing', inject(function(modeling, commandStack) {

        // given
        modeling.appendShape(task, { type: 'bpmn:Task' }, { x: 660, y: 250 }, participant);

        // when
        commandStack.undo();

        // then
        expect(participant).to.have.bounds(originalBounds);
      }));


      it('should redo resizing and restore shapes and connections',
        inject(function(modeling, commandStack) {

        // given
        var task2 = modeling.appendShape(task, { type: 'bpmn:Task' }, { x: 660, y: 250 }, participant);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var expectedBounds = assign(originalBounds, { width: 563 });

        expect(participant).to.have.bounds(expectedBounds);

        expect(task2).to.exist;
        expect(task.outgoing).not.to.be.empty;
        expect(task2.incoming).not.to.be.empty;
      }));

    });


    it('should not auto-resize when adding lane', inject(function(modeling) {

      // given
      var laneAttrs = {
        type: 'bpmn:Lane',
        width: 341,
        height: 178
      };

      // when
      modeling.createShape(laneAttrs, { x: 280, y: 200 }, participant);

      // then
      expect(participant).to.have.bounds(originalBounds);
    }));

  });


  describe('lane', function() {

    var diagramXML = require('./AutoResize.lanes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should fit new element', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_Lanes');

      // when
      modeling.createShape({ type: 'bpmn:Task' }, { x: 600, y: 320 }, participantShape);

      // then
      expect(participantShape).to.have.bounds({ x: 247, y: 160, width: 503, height: 260});
    }));


    it('should fit multiple moved elements', inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_Lanes'),
          taskShape = elementRegistry.get('Task_1'),
          startEventShape = elementRegistry.get('StartEvent_1');

      var originalBounds = getBounds(participantShape);

      // when
      modeling.moveElements([ taskShape, startEventShape ], { x: 200, y: 0 }, participantShape);

      // then
      var expectedBounds = assign(originalBounds, { width: 625 });

      expect(participantShape).to.have.bounds(expectedBounds);
    }));

  });


  describe('sub processes', function() {

    var diagramXML = require('./AutoResize.sub-processes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should auto-resize after moving children', inject(function(elementRegistry, modeling) {

      // given
      var subProcessShape = elementRegistry.get('SubProcess_1'),
          taskShape = elementRegistry.get('Task_1'),
          startEventShape = elementRegistry.get('StartEvent_1');

      var originalBounds = getBounds(subProcessShape);

      // when
      modeling.moveElements([ taskShape, startEventShape ], { x: 200, y: 0 }, subProcessShape);

      // then
      var expectedBounds = assign(originalBounds, { width: 567 });

      expect(subProcessShape).to.have.bounds(expectedBounds);
    }));


    it('should auto-resize to fit new element', inject(function(elementRegistry, modeling) {

      // given
      var subProcessShape = elementRegistry.get('SubProcess_1');

      var originalBounds = getBounds(subProcessShape);

      // when
      modeling.createShape({ type: 'bpmn:Task' }, { x: 450, y: 250 }, subProcessShape);

      // then
      var expectedBounds = assign(originalBounds, { width: 480, height: 298 });

      expect(subProcessShape).to.have.bounds(expectedBounds);
    }));


    it('should auto-resize after dropping selection inside',
      inject(function(selection, move, dragging, elementRegistry, modeling) {

      // given
      var subProcessShape = elementRegistry.get('SubProcess_1'),
          taskShape = elementRegistry.get('Task_1'),
          startEventShape = elementRegistry.get('StartEvent_1');

      var originalBounds = getBounds(subProcessShape);

      // when
      selection.select([ taskShape, startEventShape ]);

      move.start(canvasEvent({ x: 265, y: 235 }), startEventShape);

      dragging.hover({
        element: subProcessShape,
        gfx: elementRegistry.getGraphics(subProcessShape)
      });

      dragging.move(canvasEvent({ x: 450, y: 235 }));

      dragging.end();

      // then
      var expectedBounds = assign(originalBounds, { width: 552 });

      expect(subProcessShape).to.have.bounds(expectedBounds);
    }));


    it('should not auto-resize after dropping selection outside',
      inject(function(selection, canvas, move, dragging, elementRegistry, modeling) {

      // given
      var subProcessShape = elementRegistry.get('SubProcess_1'),
          taskShape = elementRegistry.get('Task_1'),
          startEventShape = elementRegistry.get('StartEvent_1'),
          rootShape = canvas.getRootElement();

      var originalBounds = getBounds(subProcessShape);

      // when
      selection.select([ taskShape, startEventShape ]);

      move.start(canvasEvent({ x: 390, y: 110 }), taskShape);

      dragging.hover({
        element: rootShape,
        gfx: elementRegistry.getGraphics(rootShape)
      });

      dragging.move(canvasEvent({ x: 600, y: 110 }));

      dragging.end();

      // then
      expect(subProcessShape).to.have.bounds(originalBounds);
    }));

  });

  describe('after moving multiple elements', function() {

    var diagramXML = require('./AutoResize.multi-selection.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var taskShape_1,
        taskShape_2,
        subProcessShape_1,
        rootShape;

    beforeEach(inject(function(elementRegistry, canvas) {
      taskShape_1 = elementRegistry.get('Task_1');
      taskShape_2 = elementRegistry.get('Task_2');
      subProcessShape_1 = elementRegistry.get('SubProcess_1');
      rootShape = canvas.getRootElement();
    }));


    it('should not expand, if elements keep their parents (different original parents)',
      inject(function(modeling) {

      // given
      var originalBounds = getBounds(subProcessShape_1);

      // when
      modeling.moveElements([ taskShape_1, taskShape_2 ],
        { x: -100, y: 0 }, subProcessShape_1, { primaryShape: taskShape_1 });

      // then
      expect(subProcessShape_1).to.have.bounds(originalBounds);

    }));


    it('should expand non-primary parents',
      inject(function(modeling) {

      // given
      var originalBounds = getBounds(subProcessShape_1);

      // when
      modeling.moveElements([ taskShape_1, taskShape_2 ],
        { x: 100, y: 0 }, rootShape, { primaryShape: taskShape_2 });

      // then
      var expectedBounds = assign(originalBounds, { width: 525 });
      expect(subProcessShape_1).to.have.bounds(expectedBounds);

    }));


    it('should expand, if elements keep their parents (same original parent)', inject(function(modeling) {

      // given
      var originalBounds = getBounds(subProcessShape_1);
      modeling.moveElements([ taskShape_2 ], { x: -110, y: 135 }, subProcessShape_1);

      // when
      modeling.moveElements([ taskShape_1, taskShape_2 ],
        { x: -110, y: 0 }, subProcessShape_1, { primaryShape: taskShape_1 });

      // then
      var expectedBounds = assign(originalBounds, { x: 0, width: 444 });
      expect(subProcessShape_1).to.have.bounds(expectedBounds);

    }));


    it('should expand, if primary shape changes parent', inject(function(modeling){

      // given
      var originalBounds = getBounds(subProcessShape_1);

      // when
      modeling.moveElements([ taskShape_1, taskShape_2 ],
        { x: 0, y: 50 }, subProcessShape_1, { primaryShape: taskShape_2 });

      // then
      var expectedBounds = assign(originalBounds, { y: 80, height: 317 });
      expect(subProcessShape_1).to.have.bounds(expectedBounds);

    }));


    it('should expand top and bottom edge, if primary shape changes parent', inject(function(modeling){

      // given
      var originalBounds = getBounds(subProcessShape_1);

      // when
      modeling.moveElements([ taskShape_1, taskShape_2 ],
        { x: 0, y: 100 }, subProcessShape_1, { primaryShape: taskShape_2 });

      // then
      var expectedBounds = assign(originalBounds, { y: 130, height: 334 });
      expect(subProcessShape_1).to.have.bounds(expectedBounds);

    }));

  });

  describe('nested sub processes', function() {

    var diagramXML = require('./AutoResize.nested-sub-processes.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should recursively expand parent element', inject(function(elementRegistry, modeling){

      var taskShape = elementRegistry.get('Task_1'),
          subProcessShape_2 = elementRegistry.get('SubProcess_2'),
          subProcessShape_3 = elementRegistry.get('SubProcess_3');

      var originalBounds = getBounds(subProcessShape_2);

      modeling.moveElements([taskShape], { x: 100, y: 0 }, subProcessShape_3);

      var expectedBounds = assign(originalBounds, { width: 755 });

      expect(subProcessShape_2).to.have.bounds(expectedBounds);
    }));

    it('should recursively expand last parent element', inject(function(elementRegistry, modeling){

      var taskShape = elementRegistry.get('Task_1'),
          subProcessShape_1 = elementRegistry.get('SubProcess_1'),
          subProcessShape_3 = elementRegistry.get('SubProcess_3');

      var originalBounds = getBounds(subProcessShape_1);

      modeling.moveElements([ taskShape ], { x: 100, y: 0 }, subProcessShape_3);

      var expectedBounds = assign(originalBounds, { width: 875 });

      expect(subProcessShape_1).to.have.bounds(expectedBounds);
    }));

  });

});
