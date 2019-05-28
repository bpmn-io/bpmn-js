import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';
import { getMid } from 'diagram-js/lib/layout/LayoutUtil';


describe('features/modeling/behavior - sub process', function() {

  var diagramXML = require('./SubProcessBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      replaceModule
    ]
  }));


  describe('replace', function() {

    describe('task -> expanded subprocess', function() {

      describe('incoming sequence flows', function() {

        it('should move', inject(function(bpmnReplace, elementRegistry) {

          // given
          var shape = elementRegistry.get('Task_1');

          // when
          var subProcess = bpmnReplace.replaceElement(shape, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          var expectedBounds = {
            x: 50,
            y: -100,
            width: 350,
            height: 200
          };

          expect(subProcess).to.have.bounds(expectedBounds);
        }));

      });


      describe('no incoming sequence flows', function() {

        it('should NOT move', inject(function(bpmnReplace, elementRegistry, modeling) {

          // given
          var task = elementRegistry.get('Task_2'),
              taskMid = getMid(task);

          // when
          var subProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          expect(getMid(subProcess)).to.eql(taskMid);
        }));

      });


      describe('outgoing sequence flows', function() {

        it('should NOT move', inject(function(bpmnReplace, elementRegistry, modeling) {

          // given
          var task = elementRegistry.get('Task_3'),
              taskMid = getMid(task);

          // when
          var subProcess = bpmnReplace.replaceElement(task, {
            type: 'bpmn:SubProcess',
            isExpanded: true
          });

          // then
          expect(getMid(subProcess)).to.eql(taskMid);
        }));

      });

    });


    describe('task -> non-subprocess', function() {

      it('should NOT move', inject(function(bpmnReplace, elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('Task_1'),
            taskMid = getMid(task);


        // when
        var callActivity = bpmnReplace.replaceElement(task, {
          type: 'bpmn:CallActivity'
        });

        // then
        expect(getMid(callActivity)).to.eql(taskMid);
      }));

    });

  });


  describe('toggle', function() {

    describe('collapsed subprocess -> expanded subprocess', function() {

      describe('incoming sequence flows', function() {

        it('should move', inject(function(elementRegistry, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1');

          // when
          modeling.toggleCollapse(subProcess);

          // then
          var expectedBounds = {
            x: 50,
            y: 100,
            width: 350,
            height: 200
          };

          expect(subProcess).to.have.bounds(expectedBounds);
        }));

      });


      describe('no incoming sequence flows', function() {

        it('should NOT move', inject(function(elementRegistry, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_2'),
              subProcessMid = getMid(subProcess);

          // when
          modeling.toggleCollapse(subProcess);

          // then
          expect(getMid(subProcess)).to.eql(subProcessMid);
        }));

      });


      describe('outgoing sequence flows', function() {

        it('should NOT move', inject(function(elementRegistry, modeling) {

          // given
          var subProcess = elementRegistry.get('SubProcess_3'),
              subProcessMid = getMid(subProcess);

          // when
          modeling.toggleCollapse(subProcess);

          // then
          expect(getMid(subProcess)).to.eql(subProcessMid);
        }));

      });

    });


    describe('expanded sub process -> collapsed sub process', function() {

      it('should move', inject(function(elementRegistry, modeling) {

        // given
        var subProcess = elementRegistry.get('SubProcess_4');

        // when
        modeling.toggleCollapse(subProcess);

        // then
        var expectedBounds = {
          x: 525,
          y: 360,
          width: 100,
          height: 80
        };

        expect(subProcess).to.have.bounds(expectedBounds);
      }));

    });

  });

});
