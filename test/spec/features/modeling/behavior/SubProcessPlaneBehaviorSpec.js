import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';
import { is } from 'lib/util/ModelUtil';

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
      expect(diagrams.length).to.equal(2);
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
      expect(diagrams.length).to.equal(1);
      expect(canvas.findRoot(planeId(subProcess))).to.not.exist;
    }));


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
      expect(diagrams.length).to.equal(1);
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
      expect(diagrams.length).to.equal(2);
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
          expect(diagrams.length).to.equal(2);
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
          expect(diagrams.length).to.equal(1);
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
          expect(diagrams.length).to.equal(2);
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
          expect(diagrams.length).to.equal(1);
          expect(canvas.findRoot(planeId(collapsedSubProcess))).to.not.exist;
        }
      ));

    });

  });

});


function planeId(element) {
  if (is(element, 'bpmn:SubProcess')) {
    return element.id + '_plane';
  }

  return element.id;
}
