import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import labelEditingModule from 'lib/features/label-editing';
import coreModule from 'lib/core';
import draggingModule from 'diagram-js/lib/features/dragging';
import modelingModule from 'lib/features/modeling';
import autoPlaceModule from 'lib/features/auto-place';

import {
  getLabel
} from 'lib/features/label-editing/LabelUtil';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

var MEDIUM_LINE_HEIGHT = 12 * 1.2;

var DELTA = 3;


describe('features - label-editing', function() {

  var diagramXML = require('./LabelEditing.bpmn');


  describe('basics', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        labelEditingModule,
        coreModule,
        draggingModule,
        modelingModule,
        autoPlaceModule
      ]
    }));


    it('should register on dblclick', inject(
      function(elementRegistry, directEditing, eventBus) {

        // given
        var shape = elementRegistry.get('Task_1');

        // when
        eventBus.fire('element.dblclick', { element: shape });

        // then
        expect(directEditing.isActive()).to.be.true;

        // clean up
        directEditing._textbox.destroy();
      }
    ));


    it('should cancel on <ESC>', inject(
      function(elementRegistry, directEditing, eventBus) {

        // given
        var shape = elementRegistry.get('Task_1'),
            task = shape.businessObject;

        var oldName = task.name;

        // activate
        eventBus.fire('element.dblclick', { element: shape });

        var textbox = directEditing._textbox.content;

        // when
        // change + ESC is pressed
        textbox.innerText = 'new value';
        triggerKeyEvent(textbox, 'keydown', 27);

        // then
        expect(directEditing.isActive()).to.be.false;
        expect(task.name).to.equal(oldName);
      }
    ));


    it('should complete on drag start', inject(
      function(elementRegistry, directEditing, dragging) {

        // given
        var shape = elementRegistry.get('Task_1'),
            task = shape.businessObject;

        directEditing.activate(shape);

        directEditing._textbox.content.textContent = 'FOO BAR';

        // when
        dragging.init(null, { x: 0, y: 0 }, 'foo');

        // then
        expect(task.name).to.equal('FOO BAR');
      }
    ));


    it('should complete on auto place', inject(
      function(elementRegistry, directEditing, elementFactory, autoPlace) {

        // given
        var shape = elementRegistry.get('Task_1'),
            task = shape.businessObject;

        directEditing.activate(shape);

        directEditing._textbox.content.textContent = 'FOO BAR';

        // when
        autoPlace.append(shape, elementFactory.create(
          'shape',
          { type: 'bpmn:ServiceTask' }
        ));

        // then
        expect(task.name).to.equal('FOO BAR');
      }
    ));


    it('should submit on root element click', inject(
      function(elementRegistry, directEditing, canvas, eventBus) {

        // given
        var shape = elementRegistry.get('Task_1'),
            task = shape.businessObject;

        // activate
        eventBus.fire('element.dblclick', { element: shape });

        var newName = 'new value';

        // a <textarea /> element
        var content = directEditing._textbox.content;

        content.innerText = newName;

        // when
        // change + <element.mousedown>

        eventBus.fire('element.mousedown', { element: canvas.getRootElement() });

        // then
        expect(directEditing.isActive()).to.be.false;
        expect(task.name).to.equal(newName);
      }
    ));

  });


  describe('details', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        labelEditingModule,
        coreModule,
        modelingModule
      ]
    }));

    var create,
        directEditing,
        dragging,
        elementFactory,
        elementRegistry,
        eventBus;

    beforeEach(inject([
      'create', 'directEditing', 'dragging',
      'elementFactory', 'elementRegistry', 'eventBus',
      function(_create, _directEditing, _dragging, _elementFactory, _elementRegistry, _eventBus) {
        create = _create;
        directEditing = _directEditing;
        dragging = _dragging;
        elementFactory = _elementFactory;
        elementRegistry = _elementRegistry;
        eventBus = _eventBus;
      }
    ]));


    function directEditActivate(element) {
      if (element.waypoints) {
        eventBus.fire('element.dblclick', { element: element });
      } else {
        eventBus.fire('element.dblclick', { element: element });
      }
    }

    function directEditUpdate(value) {
      directEditing._textbox.content.innerText = value;
    }

    function directEditComplete(value) {
      directEditUpdate(value);
      directEditing.complete();
    }

    function directEditCancel(value) {
      directEditUpdate(value);
      directEditing.cancel();
    }


    describe('command support', function() {

      it('should update via command stack', function() {

        // given
        var diagramElement = elementRegistry.get('Task_1');

        var listenerCalled;

        eventBus.on('commandStack.changed', function(e) {
          listenerCalled = true;
        });

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        // then
        expect(listenerCalled).to.be.true;
      });


      it('should undo via command stack', inject(function(commandStack) {

        // given
        var diagramElement = elementRegistry.get('Task_1');

        var oldLabel = getLabel(diagramElement);

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        commandStack.undo();

        // then
        var label = getLabel(diagramElement);
        expect(label).to.eql(oldLabel);
      }));

    });


    describe('should unset', function() {

      it('name on empty text', function() {

        // given
        var diagramElement = elementRegistry.get('SequenceFlow_1');

        // when
        directEditActivate(diagramElement);
        directEditComplete(' ');

        // then
        expect(diagramElement.businessObject.name).not.to.exist;
      });


      it('text on empty text', function() {

        // given
        var diagramElement = elementRegistry.get('TextAnnotation_1');

        // when
        directEditActivate(diagramElement);
        directEditComplete(' ');

        // then
        expect(diagramElement.businessObject.text).not.to.exist;
      });

    });


    describe('should trigger redraw', function() {

      it('on shape change', function() {

        // given
        var diagramElement = elementRegistry.get('Task_1');

        var listenerCalled;

        eventBus.on('element.changed', function(e) {
          if (e.element === diagramElement) {
            listenerCalled = true;
          }
        });

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        // then
        expect(listenerCalled).to.be.true;
      });


      it('on connection on change', function() {

        // given
        var diagramElement = elementRegistry.get('SequenceFlow_1');

        var listenerCalled;

        eventBus.on('element.changed', function(e) {
          if (e.element === diagramElement.label) {
            listenerCalled = true;
          }
        });

        // when
        directEditActivate(diagramElement);
        directEditComplete('BAR');

        // then
        expect(listenerCalled).to.be.true;
      });

    });


    describe('element support, should edit', function() {

      function directEdit(elementId) {

        return inject(function(elementRegistry, eventBus, directEditing) {

          var diagramElement = elementRegistry.get(elementId);

          var label = getLabel(diagramElement);


          // when
          directEditActivate(diagramElement);

          // then
          // expect editing to be active
          expect(directEditing.getValue()).to.eql(label);
          expect(directEditing.isActive()).to.be.true;


          // when
          directEditComplete('B');

          // then
          // expect update to have happened
          label = getLabel(diagramElement);
          expect(label).to.equal('B');


          // when
          directEditActivate(diagramElement);
          directEditCancel('C');

          // expect no label update to have happened
          label = getLabel(diagramElement);
          expect(label).to.equal('B');
        });
      }


      it('task', directEdit('Task_1'));


      it('gateway', directEdit('ExclusiveGateway_1'));

      it('gateway via label', directEdit('ExclusiveGateway_1_label'));


      it('event', directEdit('StartEvent_1'));

      it('event via label', directEdit('StartEvent_1_label'));

      it('event without label', directEdit('EndEvent_1'));


      it('data store reference', directEdit('DataStoreReference_1'));

      it('data object reference', directEdit('DataObjectReference_1'));


      it('sequenceflow', directEdit('SequenceFlow_1'));

      it('sequenceflow via label', directEdit('SequenceFlow_1_label'));

      it('sequenceflow without label', directEdit('SequenceFlow_2'));


      it('message flow', directEdit('MessageFlow_1'));

      it('message flow via label', directEdit('MessageFlow_1_label'));


      it('pool', directEdit('Participant_1'));

      it('pool, collapsed', directEdit('Participant_2'));


      it('lane with label', directEdit('Lane_1'));

      it('lane without label', directEdit('Lane_2'));


      it('data input', directEdit('DataInput'));

      it('data output', directEdit('DataOutput'));


      it('group', directEdit('Group_1'));

      it('group via label', directEdit('Group_1_label'));

    });


    describe('after elements create', function() {

      var createTaskElement;

      beforeEach(function() {

        createTaskElement = function(context) {

          var shape = elementFactory.create('shape', { type: 'bpmn:Task' }),
              parent = elementRegistry.get('SubProcess_1'),
              parentGfx = elementRegistry.getGraphics(parent);

          create.start(canvasEvent({ x: 0, y: 0 }), [ shape ], context);
          dragging.hover({
            element: parent,
            gfx: parentGfx
          });
          dragging.move(canvasEvent({ x: 400, y: 250 }));
          dragging.end();
        };

      });

      it('should activate', function() {

        // when
        createTaskElement();

        // then
        expect(directEditing.isActive()).to.be.true;

      });


      it('should NOT activate with behavior hint', function() {

        // when
        createTaskElement({
          hints: { createElementsBehavior: false }
        });

        // then
        expect(directEditing.isActive()).to.be.false;

      });


    });

  });


  describe('group support', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        labelEditingModule,
        coreModule,
        modelingModule
      ],
      canvas: { deferUpdate: false }
    }));

    it('should initialize categoryValue for empty group', inject(
      function(elementRegistry, directEditing) {

        // given
        var shape = elementRegistry.get('Group_2');

        // when
        directEditing.activate(shape);
        directEditing._textbox.content.innerText = 'FOO';
        directEditing.complete();

        // then
        var label = getLabel(shape);

        expect(shape.businessObject.categoryValueRef).to.exist;
        expect(label).to.equal('FOO');
      }
    ));

  });


  describe('sizes', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        labelEditingModule,
        coreModule,
        modelingModule
      ],
      canvas: { deferUpdate: false }
    }));


    describe('bounds', function() {

      describe('external labels', function() {

        it('[zoom 1] should have fixed width and element height', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1;

            canvas.zoom(zoom);

            var startEvent = elementRegistry.get('StartEvent_1');

            var bounds = canvas.getAbsoluteBBox(startEvent.label);
            var mid = {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2
            };

            directEditing.activate(startEvent);

            expectBounds(directEditing._textbox.parent, {
              x: mid.x - (45 * zoom),
              y: bounds.y - (7 * zoom),
              width: (90 * zoom),
              height: bounds.height + (5 * zoom) + 7
            });
          }
        ));


        it('[zoom 1.5] should have fixed width and element height', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1.5;

            canvas.zoom(zoom);

            var startEvent = elementRegistry.get('StartEvent_1');

            var bounds = canvas.getAbsoluteBBox(startEvent.label);
            var mid = {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2
            };

            directEditing.activate(startEvent);

            expectBounds(directEditing._textbox.parent, {
              x: mid.x - (45 * zoom),
              y: bounds.y - (7 * zoom),
              width: (90 * zoom),
              height: bounds.height + (5 * zoom) + (7 * zoom)
            });
          }
        ));

      });


      describe('internal labels', function() {

        it('[zoom 1] should have element size', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1;

            canvas.zoom(zoom);

            var task = elementRegistry.get('Task_1');

            var bounds = canvas.getAbsoluteBBox(task);

            directEditing.activate(task);

            expectBounds(directEditing._textbox.parent, bounds);
          }
        ));


        it('[zoom 1.5] should have element size', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1.5;

            canvas.zoom(zoom);

            var task = elementRegistry.get('Task_1');

            var bounds = canvas.getAbsoluteBBox(task);

            directEditing.activate(task);

            expectBounds(directEditing._textbox.parent, bounds);
          }
        ));

      });


      describe('sequence flows', function() {

        it('[zoom 1] should have fixed width and element height', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1;

            canvas.zoom(zoom);

            var sequenceFlow = elementRegistry.get('SequenceFlow_1');

            var bounds = canvas.getAbsoluteBBox(sequenceFlow.label);
            var mid = {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2
            };

            directEditing.activate(sequenceFlow);

            expectBounds(directEditing._textbox.parent, {
              x: mid.x - (45 * zoom),
              y: bounds.y - (7 * zoom),
              width: (90 * zoom),
              height: bounds.height + (5 * zoom) + 7
            });
          }
        ));


        it('[zoom 1.5] should have fixed width and element height', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1.5;

            canvas.zoom(zoom);

            var sequenceflow = elementRegistry.get('SequenceFlow_1');

            var bounds = canvas.getAbsoluteBBox(sequenceflow.label);
            var mid = {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2
            };

            directEditing.activate(sequenceflow);

            expectBounds(directEditing._textbox.parent, {
              x: mid.x - (45 * zoom),
              y: bounds.y - (7 * zoom),
              width: (90 * zoom),
              height: bounds.height + (5 * zoom) + (7 * zoom)
            });
          }
        ));

      });


      describe('text annotations', function() {

        it('[zoom 1] should have element size', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1;

            canvas.zoom(zoom);

            var textAnnotation = elementRegistry.get('TextAnnotation_1');

            var bounds = canvas.getAbsoluteBBox(textAnnotation);

            directEditing.activate(textAnnotation);

            expectBounds(directEditing._textbox.parent, bounds);
          }
        ));


        it('[zoom 1.5] should have element size', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1.5;

            canvas.zoom(zoom);

            var textAnnotation = elementRegistry.get('TextAnnotation_1');

            var bounds = canvas.getAbsoluteBBox(textAnnotation);

            directEditing.activate(textAnnotation);

            expectBounds(directEditing._textbox.parent, bounds);
          }
        ));

      });


      describe('expanded sub processes', function() {

        it('[zoom 1] should have element width and height to fit text', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1;

            canvas.zoom(zoom);

            var subProcess = elementRegistry.get('SubProcess_1');

            var bounds = canvas.getAbsoluteBBox(subProcess);

            directEditing.activate(subProcess);

            expectBounds(directEditing._textbox.parent, {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: (MEDIUM_LINE_HEIGHT * zoom) + (7 * 2 * zoom)
            });
          }
        ));


        it('[zoom 1.5] should have element width and height to fit text', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1.5;

            canvas.zoom(zoom);

            var subProcess = elementRegistry.get('SubProcess_1');

            var bounds = canvas.getAbsoluteBBox(subProcess);

            directEditing.activate(subProcess);

            expectBounds(directEditing._textbox.parent, {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: (MEDIUM_LINE_HEIGHT * zoom) + (7 * 2 * zoom)
            });
          }
        ));

      });


      describe('pools/lanes', function() {

        it('[zoom 1] should have width of element height, height of 30', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1;

            canvas.zoom(zoom);

            var pool = elementRegistry.get('Participant_1');

            var bounds = canvas.getAbsoluteBBox(pool);
            var mid = {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2
            };

            directEditing.activate(pool);

            expectBounds(directEditing._textbox.parent, {
              x: bounds.x - (bounds.height / 2) + (15 * zoom),
              y: mid.y - (30 * zoom) / 2,
              width: bounds.height * zoom,
              height: 30 * zoom
            });
          }
        ));


        it('[zoom 1.5] should have width of element height, height of 30', inject(
          function(canvas, directEditing, elementRegistry) {
            var zoom = 1.5;

            canvas.zoom(zoom);

            var pool = elementRegistry.get('Participant_1');

            var bounds = canvas.getAbsoluteBBox(pool);
            var mid = {
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2
            };

            directEditing.activate(pool);

            expectBounds(directEditing._textbox.parent, {
              x: bounds.x - (bounds.height / 2) + (15 * zoom),
              y: mid.y - (30 * zoom) / 2,
              width: bounds.height,
              height: 30 * zoom
            });
          }
        ));

      });

    });

  });

});


// helpers //////////////////

function triggerKeyEvent(element, event, code) {
  var e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;

  return element.dispatchEvent(e);
}

function expectBounds(parent, bounds) {
  expect(parent.offsetLeft).to.be.closeTo(bounds.x, DELTA);
  expect(parent.offsetTop).to.be.closeTo(bounds.y, DELTA);
  expect(parent.offsetWidth).to.be.closeTo(bounds.width, DELTA);
  expect(parent.offsetHeight).to.be.closeTo(bounds.height, DELTA);
}