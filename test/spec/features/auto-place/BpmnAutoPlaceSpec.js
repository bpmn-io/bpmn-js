import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import autoPlaceModule from 'lib/features/auto-place';
import coreModule from 'lib/core';
import labelEditingModule from 'lib/features/label-editing';
import modelingModule from 'lib/features/modeling';
import selectionModule from 'diagram-js/lib/features/selection';

import { getBusinessObject } from '../../../../lib/util/ModelUtil';


describe('features/auto-place', function() {

  describe('element placement', function() {

    var diagramXML = require('./BpmnAutoPlace.bpmn');

    before(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        autoPlaceModule,
        selectionModule
      ]
    }));


    describe('should place bpmn:FlowNode', function() {

      it('at default distance after START_EVENT_1', autoPlace({
        element: 'bpmn:Task',
        behind: 'START_EVENT_1',
        expectedBounds: { x: 1052, y: 224, width: 100, height: 80 }
      }));


      it('at incoming distance after TASK_0', autoPlace({
        element: 'bpmn:Task',
        behind: 'TASK_0',
        expectedBounds: { x: 262, y: 54, width: 100, height: 80 }
      }));


      it('at incoming distance / quorum after TASK_5', autoPlace({
        element: 'bpmn:Task',
        behind: 'TASK_5',
        expectedBounds: { x: 296, y: 390, width: 100, height: 80 }
      }));


      it('at existing outgoing / below TASK_2', autoPlace({
        element: 'bpmn:Task',
        behind: 'TASK_1',
        expectedBounds: { x: 279, y: 293, width: 100, height: 80 }
      }));


      it('ignoring existing, far away outgoing of TASK_3', autoPlace({
        element: 'bpmn:Task',
        behind: 'TASK_3',
        expectedBounds: { x: 746, y: 127, width: 100, height: 80 }
      }));


      it('behind bpmn:SubProcess', autoPlace({
        element: 'bpmn:Task',
        behind: 'SUBPROCESS_1',
        expectedBounds: { x: 925, y: 368, width: 100, height: 80 }
      }));


      it('after TASK_6', autoPlace({
        element: 'bpmn:Task',
        behind: 'TASK_6',
        expectedBounds: { x: 700, y: 370, width: 100, height: 80 }
      }));

    });


    describe('should place bpmn:DataStoreReference', function() {

      it('bottom right of source', autoPlace({
        element: 'bpmn:DataStoreReference',
        behind: 'TASK_2',
        expectedBounds: { x: 369, y: 303, width: 50, height: 50 }
      }));


      it('next to existing', autoPlace({
        element: 'bpmn:DataStoreReference',
        behind: 'TASK_3',
        expectedBounds: { x: 769, y: 247, width: 50, height: 50 }
      }));

    });


    describe('should place bpmn:TextAnnotation', function() {

      it('top right of source', autoPlace({
        element: 'bpmn:TextAnnotation',
        behind: 'TASK_2',
        expectedBounds: { x: 379, y: 103, width: 100, height: 30 }
      }));


      it('above existing', autoPlace({
        element: 'bpmn:TextAnnotation',
        behind: 'TASK_3',
        expectedBounds: { x: 696, y: -4, width: 100, height: 30 }
      }));


      describe('on connection', function() {

        it('top right', autoPlace({
          element: 'bpmn:TextAnnotation',
          behind: 'SequenceFlow_1',
          expectedBounds: { x: 300, y: 158, width: 100, height: 30 }
        }));


        it('above existing', autoPlace({
          element: 'bpmn:TextAnnotation',
          behind: 'SequenceFlow_1',
          expectedBounds: { x: 300, y: 98, width: 100, height: 30 }
        }));

      });

    });

  });

  describe('vertical element placement', function() {

    var diagramXML = require('./BpmnAutoPlace.vertical.bpmn');

    before(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        autoPlaceModule,
        selectionModule
      ]
    }));


    describe('should place bpmn:FlowNode', function() {

      it('at default distance after Start Event', autoPlace({
        element: 'bpmn:Task',
        behind: 'Start_Event',
        expectedBounds: { x: 570, y: 1088, width: 100, height: 80 }
      }));


      it('at incoming distance after V_Task_0', autoPlace({
        element: 'bpmn:Task',
        behind: 'V_Task_0',
        expectedBounds: { x: 260, y: 422, width: 100, height: 80 }
      }));


      it('at incoming distance / quorum after V_Task_5', autoPlace({
        element: 'bpmn:Task',
        behind: 'V_Task_5',
        expectedBounds: { x: 590, y: 452, width: 100, height: 80 }
      }));


      it('at existing outgoing / right of V_Task_2', autoPlace({
        element: 'bpmn:Task',
        behind: 'V_Task_1',
        expectedBounds: { x: 530, y: 450, width: 100, height: 80 }
      }));


      it('ignoring existing, far away outgoing of V_Task_3', autoPlace({
        element: 'bpmn:Task',
        behind: 'V_Task_3',
        expectedBounds: { x: 450, y: 1090, width: 100, height: 80 }
      }));


      it('behind bpmn:SubProcess', autoPlace({
        element: 'bpmn:Task',
        behind: 'V_Sub_Process_1',
        expectedBounds: { x: 699, y: 930, width: 100, height: 80 }
      }));


      it('below V_TASK_6', autoPlace({
        element: 'bpmn:Task',
        behind: 'V_TASK_6',
        expectedBounds: { x: 700, y: 730, width: 100, height: 80 }
      }));

    });


    describe('should place bpmn:DataStoreReference', function() {

      it('bottom right of source', autoPlace({
        element: 'bpmn:DataStoreReference',
        behind: 'V_Task_2',
        expectedBounds: { x: 310, y: 520, width: 50, height: 50 }
      }));


      it('next to existing', autoPlace({
        element: 'bpmn:DataStoreReference',
        behind: 'V_Task_3',
        expectedBounds: { x: 230, y: 915, width: 50, height: 50 }
      }));

    });


    describe('should place bpmn:TextAnnotation', function() {

      it('bottom right of source', autoPlace({
        element: 'bpmn:TextAnnotation',
        behind: 'V_Task_2',
        expectedBounds: { x: 550, y: 530, width: 100, height: 30 }
      }));


      it('right of existing', autoPlace({
        element: 'bpmn:TextAnnotation',
        behind: 'V_Task_3',
        expectedBounds: { x: 600, y: 840, width: 100, height: 30 }
      }));


      describe('on connection', function() {

        it('bottom right', autoPlace({
          element: 'bpmn:TextAnnotation',
          behind: 'SequenceFlow_1',
          expectedBounds: { x: 500, y: 445, width: 100, height: 30 }
        }));


        it('right of existing', autoPlace({
          element: 'bpmn:TextAnnotation',
          behind: 'SequenceFlow_1',
          expectedBounds: { x: 630, y: 445, width: 100, height: 30 }
        }));

      });

    });

  });


  describe('integration', function() {

    var diagramXML = require('./BpmnAutoPlace.bpmn');

    before(bootstrapModeler(diagramXML, {
      modules: [
        autoPlaceModule,
        coreModule,
        labelEditingModule,
        modelingModule,
        selectionModule
      ]
    }));


    it('should complete direct edit on autoPlace', inject(
      function(autoPlace, directEditing, elementFactory, elementRegistry) {

        // given
        var element = elementFactory.createShape({ type: 'bpmn:Task' });

        var source = elementRegistry.get('TASK_2');

        directEditing.activate(source);

        directEditing._textbox.content.textContent = 'foo';

        // when
        autoPlace.append(source, element);

        // then
        expect(getBusinessObject(source).name).to.equal('foo');
      }
    ));


    it('should select + direct edit on autoPlace', inject(
      function(autoPlace, elementRegistry, elementFactory, selection, directEditing) {

        // given
        var element = elementFactory.createShape({ type: 'bpmn:Task' });

        var source = elementRegistry.get('TASK_2');

        // when
        var newShape = autoPlace.append(source, element);

        // then
        expect(selection.get()).to.eql([ newShape ]);

        expect(directEditing.isActive()).to.be.true;
        expect(directEditing._active.element).to.equal(newShape);
      }
    ));

  });


  describe('multi connection handling', function() {

    var diagramXML = require('./BpmnAutoPlace.multi-connection.bpmn');

    before(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        autoPlaceModule,
        selectionModule,
        labelEditingModule
      ]
    }));


    it('should ignore multiple source -> target connections', inject(
      function(autoPlace, elementRegistry, elementFactory, selection, directEditing) {

        // given
        var element = elementFactory.createShape({ type: 'bpmn:Task' });

        var source = elementRegistry.get('TASK_1');
        var alignedElement = elementRegistry.get('TASK_3');

        // when
        var newShape = autoPlace.append(source, element);

        // then
        expect(newShape.x).to.eql(alignedElement.x);
      }
    ));

  });


  describe('vertical multi connection handling', function() {

    var diagramXML = require('./BpmnAutoPlace.vertical.multi-connection.bpmn');

    before(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        autoPlaceModule,
        selectionModule,
        labelEditingModule
      ]
    }));


    it('should ignore multiple source -> target connections', inject(
      function(autoPlace, elementRegistry, elementFactory, selection, directEditing) {

        // given
        var element = elementFactory.createShape({ type: 'bpmn:Task' });

        var source = elementRegistry.get('V_TASK_1');
        var alignedElement = elementRegistry.get('V_TASK_3');

        // when
        var newShape = autoPlace.append(source, element);

        // then
        expect(newShape.y).to.eql(alignedElement.y);
      }
    ));

  });


  describe('boundary event connection handling', function() {

    var diagramXML = require('./BpmnAutoPlace.boundary-events.bpmn');

    before(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        autoPlaceModule,
        selectionModule
      ]
    }));


    it('should place bottom right of BOUNDARY_BOTTOM', autoPlace({
      element: 'bpmn:Task',
      behind: 'BOUNDARY_BOTTOM',
      expectedBounds: { x: 241, y: 213, width: 100, height: 80 }
    }));


    it('should place bottom right of BOUNDARY_SUBPROCESS_BOTTOM', autoPlace({
      element: 'bpmn:Task',
      behind: 'BOUNDARY_SUBPROCESS_BOTTOM',
      expectedBounds: { x: 278, y: 495, width: 100, height: 80 }
    }));


    it('should place top right of BOUNDARY_TOP', autoPlace({
      element: 'bpmn:Task',
      behind: 'BOUNDARY_TOP',
      expectedBounds: { x: 242, y: -27, width: 100, height: 80 }
    }));


    it('should place top right of BOUNDARY_TOP_RIGHT without infinite loop', autoPlace({
      element: 'bpmn:Task',
      behind: 'BOUNDARY_TOP_RIGHT',
      expectedBounds: { x: 473, y: -27, width: 100, height: 80 }
    }));


    it('should place top right of BOUNDARY_SUBPROCESS_TOP', autoPlace({
      element: 'bpmn:Task',
      behind: 'BOUNDARY_SUBPROCESS_TOP',
      expectedBounds: { x: 275, y: 194, width: 100, height: 80 }
    }));

  });


  describe('vertical boundary event connection handling', function() {

    var diagramXML = require('./BpmnAutoPlace.vertical.boundary-events.bpmn');

    before(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        autoPlaceModule,
        selectionModule
      ]
    }));


    it('should place bottom right of V_BOUNDARY_RIGHT', autoPlace({
      element: 'bpmn:Task',
      behind: 'V_BOUNDARY_RIGHT',
      expectedBounds: { x: 420, y: 268, width: 100, height: 80 }
    }));


    it('should place bottom right of V_BOUNDARY_SUBPROCESS_RIGHT', autoPlace({
      element: 'bpmn:Task',
      behind: 'V_BOUNDARY_SUBPROCESS_RIGHT',
      expectedBounds: { x: 740, y: 278, width: 100, height: 80 }
    }));


    it('should place bottom left of V_BOUNDARY_LEFT', autoPlace({
      element: 'bpmn:Task',
      behind: 'V_BOUNDARY_LEFT',
      expectedBounds: { x: 140, y: 268, width: 100, height: 80 }
    }));


    it('should place bottom left of V_BOUNDARY_BOTTOM_LEFT', autoPlace({
      element: 'bpmn:Task',
      behind: 'V_BOUNDARY_BOTTOM_LEFT',
      expectedBounds: { x: 140, y: 438, width: 100, height: 80 }
    }));


    it('should place bottom left of V_BOUNDARY_SUBPROCESS_LEFT', autoPlace({
      element: 'bpmn:Task',
      behind: 'V_BOUNDARY_SUBPROCESS_LEFT',
      expectedBounds: { x: 420, y: 278, width: 100, height: 80 }
    }));

  });


  describe('nested element placement', function() {

    describe('in collapsed subprocess', function() {

      var diagramXML = require('./BpmnAutoPlace.subprocess.bpmn');

      before(bootstrapModeler(diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          autoPlaceModule
        ]
      }));

      beforeEach(inject(function(canvas) {
        canvas.setRootElement(canvas.findRoot('Sub_Process_plane'));
      }));


      it('should place node horizontally after Nested_Start_Event', autoPlace({
        element: 'bpmn:Task',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 265, y: 57, width: 100, height: 80 }
      }));


      it('should place annotation horizontally above Nested_Start_Event', autoPlace({
        element: 'bpmn:TextAnnotation',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 215, y: -1, width: 100, height: 30 }
      }));


      it('should place data store horizontally below Nested_Start_Event', autoPlace({
        element: 'bpmn:DataStoreReference',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 205, y: 155, width: 50, height: 50 }
      }));

    });


    describe('in collapsed horizontal subprocess', function() {

      var diagramXML = require('./BpmnAutoPlace.subprocess.horizontal.bpmn');

      before(bootstrapModeler(diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          autoPlaceModule
        ]
      }));

      beforeEach(inject(function(canvas) {
        canvas.setRootElement(canvas.findRoot('Sub_Process_plane'));
      }));


      it('should place node horizontally after Nested_Start_Event', autoPlace({
        element: 'bpmn:Task',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 265, y: 77, width: 100, height: 80 }
      }));


      it('should place annotation horizontally above Nested_Start_Event', autoPlace({
        element: 'bpmn:TextAnnotation',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 215, y: 19, width: 100, height: 30 }
      }));


      it('should place data store horizontally below Nested_Start_Event', autoPlace({
        element: 'bpmn:DataStoreReference',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 205, y: 175, width: 50, height: 50 }
      }));

    });


    describe('in collapsed vertical subprocess', function() {

      var diagramXML = require('./BpmnAutoPlace.subprocess.vertical.bpmn');

      before(bootstrapModeler(diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          autoPlaceModule
        ]
      }));

      beforeEach(inject(function(canvas) {
        canvas.setRootElement(canvas.findRoot('Sub_Process_plane'));
      }));


      it('should place node vertically after Nested_Start_Event', autoPlace({
        element: 'bpmn:Task',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 127, y: 165, width: 100, height: 80 }
      }));


      it('should place annotation vertically right of Nested_Start_Event', autoPlace({
        element: 'bpmn:TextAnnotation',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 245, y: 115, width: 100, height: 30 }
      }));


      it('should place data store vertically left of Nested_Start_Event', autoPlace({
        element: 'bpmn:DataStoreReference',
        behind: 'Nested_Start_Event',
        expectedBounds: { x: 69, y: 105, width: 50, height: 50 }
      }));

    });

  });

});


// helpers //////////

function autoPlace(cfg) {

  var element = cfg.element,
      behind = cfg.behind,
      expectedBounds = cfg.expectedBounds;

  return inject(function(autoPlace, elementRegistry, elementFactory) {

    var sourceEl = elementRegistry.get(behind);

    // assume
    expect(sourceEl).to.exist;

    if (typeof element === 'string') {
      element = { type: element };
    }

    var shape = elementFactory.createShape(element);

    // when
    var placedShape = autoPlace.append(sourceEl, shape);

    // then
    expect(placedShape).to.have.bounds(expectedBounds);
  });
}
