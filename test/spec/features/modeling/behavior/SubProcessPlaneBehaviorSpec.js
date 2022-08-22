import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';
import bpmnCopyPasteModule from 'lib/features/copy-paste';
import copyPasteModule from 'diagram-js/lib/features/copy-paste';

import { is } from 'lib/util/ModelUtil';
import { keys } from 'min-dash';

describe('features/modeling/behavior - subprocess planes', function() {

  var diagramXML = require('./SubProcessBehavior.planes.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      replaceModule
    ]
  }));


  describe('create', function() {

    it('should create new diagram for collapsed subprocess', inject(function(elementFactory, modeling, canvas, bpmnjs) {

      // given
      var subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        isExpanded: false
      });

      // when
      modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());

      // then
      var diagrams = bpmnjs.getDefinitions().diagrams;
      expect(diagrams).to.have.length(2);
      expect(canvas.findRoot(planeId(subProcess))).to.exist;
    }));


    it('should not create new plane for expanded subprocess', inject(function(elementFactory, modeling, canvas, bpmnjs) {

      // given
      var subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        isExpanded: true
      });

      // when
      modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());

      // then
      var diagrams = bpmnjs.getDefinitions().diagrams;
      expect(diagrams).to.have.length(1);
      expect(canvas.findRoot(planeId(subProcess))).to.not.exist;
    }));


    it('should move children to plane for collapsed subprocess', inject(function(elementFactory, modeling, canvas, bpmnjs) {

      // given
      var subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        isExpanded: false
      });

      var child = elementFactory.createShape({
        type: 'bpmn:Task',
        parent: subProcess
      });

      // when
      modeling.createElements([ subProcess, child ], { x: 300, y: 300 }, canvas.getRootElement());

      // then
      var diagrams = bpmnjs.getDefinitions().diagrams;
      var newPlane = canvas.findRoot(planeId(subProcess));
      expect(diagrams.length).to.equal(2);
      expect(newPlane).to.exist;
      expect(child.parent).to.equal(newPlane);
    }));


    it('should move labels to plane for collapsed subprocess', inject(
      function(canvas, bpmnReplace, elementRegistry, modeling) {

        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            startEvent = elementRegistry.get('StartEvent_1'),
            subProcess = elementRegistry.get('SubProcess_2'),
            task = elementRegistry.get('Task_2');

        // moving label will set its parent to root element
        modeling.moveShape(startEvent.label, { x: 0, y: 100 }, subProcess);

        // assume
        expect(sequenceFlow.parent).to.equal(subProcess);
        expect(startEvent.parent).to.equal(subProcess);
        expect(startEvent.label.parent).to.equal(canvas.getRootElement());
        expect(task.parent).to.equal(subProcess);

        // when
        bpmnReplace.replaceElement(subProcess, {
          type: 'bpmn:SubProcess',
          isExpanded: false
        });

        // then
        var plane = elementRegistry.get('SubProcess_2_plane');

        expect(sequenceFlow.parent).to.equal(plane);
        expect(startEvent.parent).to.equal(plane);
        expect(startEvent.label.parent).to.equal(plane);
        expect(task.parent).to.equal(plane);
      }
    ));


    it('should undo', inject(function(elementFactory, modeling, commandStack, canvas, bpmnjs) {

      // given
      var subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        isExpanded: false
      });
      modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());

      // when
      commandStack.undo();

      // then
      var diagrams = bpmnjs.getDefinitions().diagrams;
      expect(diagrams).to.have.length(1);
      expect(canvas.findRoot(planeId(subProcess))).to.not.exist;
    }));


    it('should redo', inject(function(elementFactory, modeling, commandStack, canvas, bpmnjs) {

      // given
      var subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        isExpanded: false
      });
      modeling.createShape(subProcess, { x: 300, y: 300 }, canvas.getRootElement());
      var plane = canvas.findRoot(planeId(subProcess));

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      var diagrams = bpmnjs.getDefinitions().diagrams;
      expect(diagrams).to.have.length(2);
      expect(canvas.findRoot(planeId(subProcess))).to.exist;
      expect(canvas.findRoot(planeId(subProcess))).to.equal(plane);
    }));

  });


  describe('replace', function() {

    describe('task -> collapsed subprocess', function() {

      it('should add new diagram for collapsed subprocess', inject(
        function(elementRegistry, bpmnReplace, bpmnjs, canvas) {

          // given
          var task = elementRegistry.get('Task_1'),
              collapsedSubProcess;

          // when
          collapsedSubProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:SubProcess',
            isExpanded: false
          });

          // then
          var diagrams = bpmnjs.getDefinitions().diagrams;
          expect(diagrams).to.have.length(2);
          expect(canvas.findRoot(planeId(collapsedSubProcess))).to.exist;
        }
      ));


      it('should undo', inject(
        function(elementRegistry, bpmnReplace, bpmnjs, canvas, commandStack) {

          // given
          var task = elementRegistry.get('Task_1'),
              collapsedSubProcess = bpmnReplace.replaceElement(task, {
                type: 'bpmn:SubProcess',
                isExpanded: false
              });

          // when
          commandStack.undo();


          // then
          var diagrams = bpmnjs.getDefinitions().diagrams;
          expect(diagrams).to.have.length(1);
          expect(canvas.findRoot(planeId(collapsedSubProcess))).to.not.exist;
        }
      ));


      it('should redo', inject(
        function(elementRegistry, bpmnReplace, bpmnjs, canvas, commandStack) {

          // given
          var task = elementRegistry.get('Task_1'),
              collapsedSubProcess = bpmnReplace.replaceElement(task, {
                type: 'bpmn:SubProcess',
                isExpanded: false
              });

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var diagrams = bpmnjs.getDefinitions().diagrams;
          expect(diagrams).to.have.length(2);
          expect(canvas.findRoot(planeId(collapsedSubProcess))).to.exist;
        }
      ));
    });

    describe('task -> expanded subprocess', function() {

      it('should not add new diagram for collapsed subprocess', inject(
        function(elementRegistry, bpmnReplace, bpmnjs, canvas) {

          // given
          var task = elementRegistry.get('Task_1'),
              collapsedSubProcess;

          // when
          collapsedSubProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          var diagrams = bpmnjs.getDefinitions().diagrams;
          expect(diagrams).to.have.length(1);
          expect(canvas.findRoot(planeId(collapsedSubProcess))).to.not.exist;
        }
      ));

    });

  });


  describe('remove', function() {

    var multipleDiagramXML = require('./SubProcessBehavior.multiple-planes.bpmn');

    beforeEach(bootstrapModeler(multipleDiagramXML, {
      modules: [
        coreModule,
        modelingModule,
        replaceModule
      ]
    }));

    it('should recursively remove diagrams', inject(function(elementRegistry, modeling, bpmnjs) {

      // given
      var subProcess = elementRegistry.get('SubProcess_2');

      // when
      modeling.removeShape(subProcess);

      // then
      var nestedTask = elementRegistry.get('nested_task');
      var diagrams = bpmnjs.getDefinitions().diagrams;
      expect(diagrams).to.have.length(1);
      expect(nestedTask).to.not.exist;
    }));


    it('should undo', inject(function(elementRegistry, modeling, bpmnjs, commandStack) {

      // given
      var subProcess = elementRegistry.get('SubProcess_2');
      modeling.removeShape(subProcess);

      // when
      commandStack.undo();

      // then
      var nestedTask = elementRegistry.get('nested_task');
      var diagrams = bpmnjs.getDefinitions().diagrams;
      expect(diagrams).to.have.length(3);
      expect(nestedTask).to.exist;
    }));


    it('should undo', inject(function(elementRegistry, modeling, bpmnjs, commandStack) {

      // given
      var subProcess = elementRegistry.get('SubProcess_2');
      modeling.removeShape(subProcess);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      var nestedTask = elementRegistry.get('nested_task');
      var diagrams = bpmnjs.getDefinitions().diagrams;
      expect(diagrams).to.have.length(1);
      expect(nestedTask).to.not.exist;
    }));

  });


  describe('update', function() {

    var multipleDiagramXML = require('./SubProcessBehavior.multiple-planes.bpmn');

    beforeEach(bootstrapModeler(multipleDiagramXML, {
      modules: [
        coreModule,
        modelingModule,
        replaceModule
      ]
    }));


    describe('do', function() {

      it('should update plane id when primary shape is changed',
        inject(function(modeling, elementRegistry) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              plane = elementRegistry.get('SubProcess_2_plane');

          // when
          modeling.updateProperties(subProcess, { id: 'new_name' });

          // then
          expect(subProcess.id).to.equal('new_name');
          expect(plane.id).to.equal('new_name_plane');
        }));


      it('should update primary shape id when plane is changed',
        inject(function(modeling, elementRegistry) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              plane = elementRegistry.get('SubProcess_2_plane');

          // when
          modeling.updateProperties(plane, { id: 'new_name' });

          // then
          expect(subProcess.id).to.equal('new_name');
          expect(plane.id).to.equal('new_name_plane');
        }));

    });


    describe('undo', function() {

      it('should update plane id when primary shape is changed',
        inject(function(modeling, elementRegistry, commandStack) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              plane = elementRegistry.get('SubProcess_2_plane');

          // when
          modeling.updateProperties(subProcess, { id: 'new_name' });
          commandStack.undo();

          // then
          expect(subProcess.id).to.equal('SubProcess_2');
          expect(plane.id).to.equal('SubProcess_2_plane');
        }));


      it('should update primary shape id when plane is changed',
        inject(function(modeling, elementRegistry, commandStack) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              plane = elementRegistry.get('SubProcess_2_plane');

          // when
          modeling.updateProperties(plane, { id: 'new_name' });
          commandStack.undo();

          // then
          expect(subProcess.id).to.equal('SubProcess_2');
          expect(plane.id).to.equal('SubProcess_2_plane');
        }));

    });


    describe('redo', function() {

      it('should update plane id when primary shape is changed',
        inject(function(modeling, elementRegistry, commandStack) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              plane = elementRegistry.get('SubProcess_2_plane');

          // when
          modeling.updateProperties(subProcess, { id: 'new_name' });
          commandStack.undo();
          commandStack.redo();

          // then
          expect(subProcess.id).to.equal('new_name');
          expect(plane.id).to.equal('new_name_plane');
        }));


      it('should update primary shape id when plane is changed',
        inject(function(modeling, elementRegistry, commandStack) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              plane = elementRegistry.get('SubProcess_2_plane');

          // when
          modeling.updateProperties(plane, { id: 'new_name' });
          commandStack.undo();
          commandStack.redo();

          // then
          expect(subProcess.id).to.equal('new_name');
          expect(plane.id).to.equal('new_name_plane');
        }));

    });


    it('should rerender primary shape name when plane is changed',
      inject(function(modeling, elementRegistry, eventBus) {

        // given
        var subProcess = elementRegistry.get('SubProcess_2'),
            plane = elementRegistry.get('SubProcess_2_plane');

        var changedSpy = sinon.spy();

        eventBus.on('element.changed', 5000, changedSpy);

        // when
        modeling.updateProperties(plane, { name: 'new name' });

        // then
        expect(changedSpy).to.have.been.calledTwice;
        expect(changedSpy.secondCall.args[0].element).to.eql(subProcess);
      })
    );

  });


  describe('copy/paste', function() {

    var copyXML = require('./SubProcessBehavior.copy-paste.bpmn');

    beforeEach(bootstrapModeler(copyXML, {
      modules: [
        coreModule,
        modelingModule,
        bpmnCopyPasteModule,
        copyPasteModule
      ]
    }));


    it('should copy collapsed sub process', inject(function(copyPaste, elementRegistry) {

      var subprcoess = elementRegistry.get('SubProcess_3');


      // when
      var tree = copyPaste.copy([ subprcoess ]);

      // then
      expect(keys(tree)).to.have.length(3);


      expect(tree[ 0 ]).to.have.length(1);
      expect(tree[ 1 ]).to.have.length(3);
      expect(tree[ 2 ]).to.have.length(12);
    }));


    it('should paste subprocess plane', inject(
      function(canvas, copyPaste, elementRegistry) {

        // given
        var subprcoess = elementRegistry.get('SubProcess_3'),
            rootElement = canvas.getRootElement();

        copyPaste.copy(subprcoess);

        // when
        var elements = copyPaste.paste({
          element: rootElement,
          point: {
            x: 300,
            y: 300
          }
        });


        // then
        var subprocess = elements[0];
        var newRoot = canvas.findRoot(planeId(subprocess));

        expect(newRoot).to.exist;
        expect(newRoot.children).to.have.length(6);
      }
    ));

  });

});


function planeId(element) {
  if (is(element, 'bpmn:SubProcess')) {
    return element.id + '_plane';
  }

  return element.id;
}
