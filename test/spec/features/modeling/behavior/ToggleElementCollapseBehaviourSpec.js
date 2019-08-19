import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import { is } from 'lib/util/ModelUtil';

var testModules = [
  modelingModule,
  coreModule
];


describe('features/modeling - collapse and expand elements', function() {

  var diagramXML = require('./ToggleElementCollapseBehaviour.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
  }));


  describe('expand', function() {

    var defaultSize = {
      width: 350,
      height: 200
    };


    it('collapsed-marker is removed',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var collapsedSubProcess = elementRegistry.get('SubProcess_3');

        // when
        var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: true
          }
        );
        var businessObject = expandedSubProcess.businessObject;

        // then +-marker is removed
        expect(businessObject.di.isExpanded).to.eql(true);
      })
    );


    it('show all children, but hide empty labels',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var collapsedSubProcess = elementRegistry.get('SubProcess_1');
        var originalChildren = collapsedSubProcess.children.slice();

        // when
        var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: true
          }
        );

        // then keep children
        originalChildren.forEach(function(c) {
          expect(expandedSubProcess.children).to.include(c);
        });

        // and show them
        expect(expandedSubProcess.children).to.satisfy(allShown());
      })
    );


    it('keep ad-hoc and multiInstance-marker',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var collapsedAdHocSubProcess = elementRegistry.get('SubProcess_4');

        // when
        var expandedAdHocSubProcess = bpmnReplace.replaceElement(collapsedAdHocSubProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: true
          }
        );

        // then
        expect(is(expandedAdHocSubProcess, 'bpmn:AdHocSubProcess')).to.eql(true);
        var businessObject = expandedAdHocSubProcess.businessObject;
        expect(businessObject.loopCharacteristics).not.to.be.undefined;
      })
    );


    describe('resizing', function() {


      it('ignors hidden children',
        inject(function(elementRegistry, bpmnReplace, eventBus) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_5');
          var hiddenStartEvent = elementRegistry.get('StartEvent_6');
          eventBus.once('commandStack.shape.toggleCollapse.postExecute', function(e) {
            hiddenStartEvent.hidden = true;
          });

          // when
          var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // then hidden child should not be covered
          expect(expandedSubProcess.x).to.be.greaterThan(hiddenStartEvent.x);
          expect(expandedSubProcess.y).to.be.greaterThan(hiddenStartEvent.y);
        })
      );


      it('without children is centered and has defaultBounds',
        inject(function(elementRegistry, bpmnReplace) {

          // given collapsed SubProcess without children
          var collapsedSubProcess = elementRegistry.get('SubProcess_3');

          var oldMid = {
            x: collapsedSubProcess.x + collapsedSubProcess.width / 2,
            y: collapsedSubProcess.y + collapsedSubProcess.height / 2
          };

          // when
          var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // then
          var newMid = {
            x: expandedSubProcess.x + expandedSubProcess.width / 2,
            y: expandedSubProcess.y + expandedSubProcess.height / 2
          };

          expect(newMid).to.eql(oldMid);
          expect(expandedSubProcess.width).to.be.at.least(defaultSize.width);
          expect(expandedSubProcess.height).to.be.at.least(defaultSize.height);
        })
      );


      it('with children is centered to childrenBoundingBox and has at least defaultBounds',
        inject(function(elementRegistry, bpmnReplace) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_4');

          // when
          var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // then
          var startEvent = elementRegistry.get('StartEvent_5');
          var midChildren = {
            x: startEvent.x + startEvent.width / 2,
            y: startEvent.y + startEvent.height / 2
          };

          var expandedMid = {
            x: expandedSubProcess.x + expandedSubProcess.width / 2,
            y: expandedSubProcess.y + expandedSubProcess.height / 2
          };

          expect(expandedMid).to.eql(midChildren),
          expect(expandedSubProcess.width).to.be.at.least(defaultSize.width);
          expect(expandedSubProcess.height).to.be.at.least(defaultSize.height);
        })
      );


      it('to expanding collapsedSubProcess is coverd in childrenBoundingBox',
        inject(function(elementRegistry, bpmnReplace) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_5');
          var collapsedDownRightCorner = {
            x: collapsedSubProcess.x + collapsedSubProcess.width,
            y: collapsedSubProcess.y + collapsedSubProcess.height
          };

          // when
          var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // then
          var expandedDownRightCorner = {
            x: expandedSubProcess.x + expandedSubProcess.width,
            y: expandedSubProcess.y + expandedSubProcess.height
          };

          expect(expandedDownRightCorner.x).to.be.at.least(collapsedDownRightCorner.x);
          expect(expandedDownRightCorner.y).to.be.at.least(collapsedDownRightCorner.y);
        })
      );

    });


    describe('undo', function() {


      it('collapsed-marker is placed',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_1');
          var expandedSubProcess = bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // when
          commandStack.undo();
          var businessObject = expandedSubProcess.businessObject;

          // then +-marker is placed
          expect(businessObject.di.isExpanded).to.eql(false);
        })
      );


      it('restore previous bounds',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_1');
          var originalBounds = {
            x: collapsedSubProcess.x,
            y: collapsedSubProcess.y,
            width: collapsedSubProcess.width,
            height: collapsedSubProcess.height
          };

          bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // when
          commandStack.undo();

          // then
          expect(collapsedSubProcess).to.have.bounds(originalBounds);
        })
      );


      it('hide children',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_1');
          var originalChildren = collapsedSubProcess.children.slice();

          bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // when
          commandStack.undo();

          // then keep children
          originalChildren.forEach(function(c) {
            expect(collapsedSubProcess.children).to.include(c);
          });

          // and hide them
          expect(collapsedSubProcess.children).to.satisfy(allHidden());
        })
      );

    });

  });


  describe('collapse', function() {

    var defaultSize = {
      width: 100,
      height: 80
    };


    it('collapsed-marker is placed',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var expandedSubProcess = elementRegistry.get('SubProcess_2');

        // when
        var collapsedSubProcess = bpmnReplace.replaceElement(expandedSubProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: false
          }
        );
        var businessObject = collapsedSubProcess.businessObject;

        // then +-marker is set
        expect(businessObject.di.isExpanded).to.eql(false);
      })
    );


    it('hide all children',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var expandedSubProcess = elementRegistry.get('SubProcess_2');
        var originalChildren = expandedSubProcess.children.slice();

        // when
        var collapsedSubProcess = bpmnReplace.replaceElement(expandedSubProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: false
          }
        );

        // then keep children
        originalChildren.forEach(function(c) {
          expect(collapsedSubProcess.children).to.include(c);
        });

        // and hide them
        expect(collapsedSubProcess.children).to.satisfy(allHidden());
      })
    );


    it('keep ad-hoc and multiInstance-marker',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var expandedSubProcess = elementRegistry.get('SubProcess_2');

        // when
        var collapsedSubProcess = bpmnReplace.replaceElement(expandedSubProcess,
          {
            type: 'bpmn:SubProcess',
            isExpanded: false
          }
        );

        // then
        expect(is(collapsedSubProcess, 'bpmn:AdHocSubProcess')).to.eql(true);
        var businessObject = collapsedSubProcess.businessObject;
        expect(businessObject.loopCharacteristics).not.to.be.undefined;
      })
    );


    describe('resize', function() {

      it('is centered and has default bounds',
        inject(function(elementRegistry, bpmnReplace) {

          // given
          var expandedSubProcess = elementRegistry.get('SubProcess_2');
          var oldMid = {
            x: expandedSubProcess.x + expandedSubProcess.width / 2,
            y: expandedSubProcess.y + expandedSubProcess.height / 2
          };

          // when
          var collapsedSubProcess = bpmnReplace.replaceElement(expandedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: false
            }
          );

          // then
          var newMid = {
            x: collapsedSubProcess.x + collapsedSubProcess.width / 2,
            y: collapsedSubProcess.y + collapsedSubProcess.height / 2
          };

          expect(newMid).to.eql(oldMid);
          expect(collapsedSubProcess.width).to.be.at.least(defaultSize.width);
          expect(collapsedSubProcess.height).to.be.at.least(defaultSize.height);

        })
      );

    });


    describe('undo', function() {

      it('collapsed marker is removed',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var expandedSubProcess = elementRegistry.get('SubProcess_2');
          var collapsedSubProcess = bpmnReplace.replaceElement(expandedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: false
            }
          );

          // when
          commandStack.undo();
          var businessObject = collapsedSubProcess.businessObject;

          // then +-marker is placed
          expect(businessObject.di.isExpanded).to.eql(true);
        })
      );


      it('originalBounds are restored',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var expandedSubProcess = elementRegistry.get('SubProcess_2');
          var originalBounds = {
            x: expandedSubProcess.x,
            y: expandedSubProcess.y,
            width: expandedSubProcess.width,
            height: expandedSubProcess.height
          };

          bpmnReplace.replaceElement(expandedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: false
            }
          );

          // when
          commandStack.undo();

          // then
          expect(expandedSubProcess).to.have.bounds(originalBounds);
        })
      );


      it('show children that were visible',
        inject(function(elementRegistry, bpmnReplace, commandStack) {

          // given
          var expandedSubProcess = elementRegistry.get('SubProcess_2');
          var originalChildren = expandedSubProcess.children.slice();

          bpmnReplace.replaceElement(expandedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: false
            }
          );

          // when
          commandStack.undo();

          // then keep children
          originalChildren.forEach(function(c) {
            expect(expandedSubProcess.children).to.include(c);
          });

          // and show the previously visible ones
          expect(expandedSubProcess.children).to.satisfy(allShown());
        })
      );

    });
  });


  describe('attaching marker', function() {

    describe('collapsed', function() {

      it('add ad-hoc-marker does not call toggleProvider',
        inject(function(eventBus, bpmnReplace, elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_3');

          // should not be called
          eventBus.once('commandStack.shape.toggleCollapse.execute', function(e) {
            expect(true).to.eql(false);
          });

          // when
          bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:AdHocSubProcess',
              isExpanded: false
            }
          );

          // then

        })
      );


      it('remove ad-hoc-marker does not call toggleProvider',
        inject(function(eventBus, bpmnReplace, elementRegistry) {

          // given
          var collapsedSubProcess = elementRegistry.get('SubProcess_4');

          // should not be called
          eventBus.once('commandStack.shape.toggleCollapse.execute', function(e) {
            expect(true).to.eql(false);
          });

          // when
          bpmnReplace.replaceElement(collapsedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: false
            }
          );

          // then

        })
      );

    });


    describe('expanded', function() {

      it('add ad-hoc-marker does not call toggleProvider',
        inject(function(eventBus, bpmnReplace, elementRegistry) {

          // given
          var expandedSubProcess = elementRegistry.get('SubProcess_6');

          // should not be called
          eventBus.once('commandStack.shape.toggleCollapse.execute', function(e) {
            expect(true).to.eql(false);
          });

          // when
          bpmnReplace.replaceElement(expandedSubProcess,
            {
              type: 'bpmn:AdHocSubProcess',
              isExpanded: true
            }
          );

          // then

        })
      );


      it('remove ad-hoc-marker does not call toggleProvider',
        inject(function(eventBus, bpmnReplace, elementRegistry) {

          // given
          var expandedSubProcess = elementRegistry.get('SubProcess_2');

          // should not be called
          eventBus.once('commandStack.shape.toggleCollapse.execute', function(e) {
            expect(true).to.eql(false);
          });

          // when
          bpmnReplace.replaceElement(expandedSubProcess,
            {
              type: 'bpmn:SubProcess',
              isExpanded: true
            }
          );

          // then

        })
      );

    });

  });


});


// helpers //////////////////////


function allHidden() {
  return childrenHidden(true);
}

function allShown() {
  return childrenHidden(false);
}

function childrenHidden(hidden) {
  return function(children) {
    return children.every(function(child) {

      // empty labels are allways hidden
      if (child.type === 'label' && !child.businessObject.name) {
        return child.hidden;
      }
      else {
        return child.hidden == hidden;
      }
    });
  };
}
