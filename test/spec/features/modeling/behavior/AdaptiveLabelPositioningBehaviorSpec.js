import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { getOrientation } from 'diagram-js/lib/layout/LayoutUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

var testModules = [
  modelingModule,
  coreModule
];

var ATTACH = { attach: true };


describe('modeling/behavior - AdaptiveLabelPositioningBehavior', function() {

  function expectLabelOrientation(element, expectedOrientation) {

    var label = element.label;

    // assume
    expect(label).to.exist;

    // when
    var orientation = getOrientation(label, element);

    // then
    expect(orientation).to.eql(expectedOrientation);
  }


  describe('basics', function() {

    var diagramXML = require('./AdaptiveLabelPositioningBehavior.basics.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    describe('on connect', function() {

      it('should move label from LEFT to TOP', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelBottom'),
            target = elementRegistry.get('LabelLeft');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(source, 'bottom');
        expectLabelOrientation(target, 'top');
      }));


      it('should move label from BOTTOM to TOP', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelBottom'),
            target = elementRegistry.get('LabelRight');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(source, 'top');
        expectLabelOrientation(target, 'right');
      }));


      it('should move label from RIGHT to TOP', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelRight'),
            target = elementRegistry.get('LabelTop');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(source, 'top');
        expectLabelOrientation(target, 'top');
      }));


      it('should move label from TOP to LEFT', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelTop'),
            target = elementRegistry.get('LabelLeft');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(source, 'left');
        expectLabelOrientation(target, 'left');
      }));


      it('should move label from TOP to LEFT', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelTop'),
            target = elementRegistry.get('LabelLeft');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(source, 'left');
        expectLabelOrientation(target, 'left');
      }));


      it('should move label from TOP to LEFT (inverse)', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelLeft'),
            target = elementRegistry.get('LabelTop');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(target, 'left');
        expectLabelOrientation(source, 'left');
      }));


      it('should keep unaligned labels AS IS', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelBottomLeft'),
            target = elementRegistry.get('LabelTop');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(source, 'bottom');
        expectLabelOrientation(target, 'top');
      }));


      it('should keep label where it is, if no options', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelImpossible'),
            target = elementRegistry.get('Task');

        // when
        modeling.connect(source, target);

        // then
        expectLabelOrientation(source, 'right');
      }));

    });


    describe('on reconnect', function() {

      it('should move label from TOP to BOTTOM', inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('SequenceFlow_1'),
            source = elementRegistry.get('LabelTop'),
            target = elementRegistry.get('LabelLeft');

        // when
        modeling.reconnectEnd(connection, target, { x: target.x + target.width / 2, y: target.y });

        // then
        expectLabelOrientation(source, 'bottom');
        expectLabelOrientation(target, 'left');
      }));

    });


    describe('on target move / layout', function() {

      it('should move label from TOP to BOTTOM', inject(function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelTop'),
            target = elementRegistry.get('LabelBottom_3');

        // when
        modeling.moveElements([ source ], { x: 0, y: 300 });

        // then
        expectLabelOrientation(source, 'bottom');
        expectLabelOrientation(target, 'top');
      }));

    });


    describe('on source move / layout', function() {

      it('should move label from BOTTOM to TOP', inject(
        function(elementRegistry, modeling) {

          // given
          var source = elementRegistry.get('LabelTop'),
              target = elementRegistry.get('LabelBottom_3');

          // when
          modeling.moveElements([ target ], { x: 20, y: -300 });

          // then
          expectLabelOrientation(source, 'bottom');
          expectLabelOrientation(target, 'top');
        }
      ));

    });


    describe('on waypoints update', function() {

      it('should move label from RIGHT to TOP', inject(function(elementRegistry, modeling) {

        // given
        var connection = elementRegistry.get('SequenceFlow_2'),
            source = elementRegistry.get('LabelRight'),
            target = elementRegistry.get('LabelBottom');

        // when
        modeling.updateWaypoints(connection, [
          {
            original: { x: 131, y: 248 },
            x: 131,
            y: 248
          },
          {
            x: 250,
            y: 248
          },
          {
            x: 250,
            y: 394
          },
          {
            original: { x: 131, y: 394 },
            x: 131,
            y: 394
          },
        ]);

        // then
        expectLabelOrientation(source, 'top');
        expectLabelOrientation(target, 'bottom');
      }));

    });


    describe('on label creation', function() {

      describe('through <element.updateProperties>', function() {

        it('should create label at TOP', inject(
          function(elementRegistry, modeling) {

            // given
            var element = elementRegistry.get('NoLabel');

            // when
            modeling.updateProperties(element, { name: 'FOO BAR' });

            // then
            expectLabelOrientation(element, 'top');
          }
        ));

      });

    });

  });


  describe('boundary-events', function() {

    var diagramXML = require('./AdaptiveLabelPositioningBehavior.boundary-events.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    describe('on boundary label creation', function() {

      it('should NOT create label onto host', inject(
        function(elementRegistry, modeling) {

          // given
          var element = elementRegistry.get('BoundaryEvent_1');

          // when
          modeling.updateProperties(element, { name: 'FOO BAR' });

          // then
          expectLabelOrientation(element, 'bottom');
        }
      ));


      it('should create label to the left', inject(
        function(elementRegistry, modeling) {

          // given
          var element = elementRegistry.get('BoundaryEvent_4');

          // when
          modeling.updateProperties(element, { name: 'FOO BAR' });

          // then
          expectLabelOrientation(element, 'left');
        }
      ));

    });


    describe('on connect', function() {

      it('should keep label where it is if no better position', inject(
        function(elementRegistry, modeling) {

          // given
          var source = elementRegistry.get('BoundaryEvent_2'),
              target = elementRegistry.get('EndEvent_2');

          // when
          modeling.connect(source, target);

          // then
          expectLabelOrientation(source, 'right');
        }
      ));

    });


    describe('on reconnect', function() {

      it('should keep label where it is if no better position', inject(
        function(elementRegistry, modeling) {

          // given
          var source = elementRegistry.get('BoundaryEvent_3'),
              target = elementRegistry.get('EndEvent_1'),
              connection = elementRegistry.get('SequenceFlow_2');

          // when
          modeling.reconnectEnd(connection, target, { x: target.x + target.width / 2, y: target.y });

          // then
          expectLabelOrientation(source, 'bottom');
        }
      ));

    });


    describe('on boundary move', function() {

      it('should move label to the left', inject(
        function(elementRegistry, modeling) {

          // given
          var element = elementRegistry.get('BoundaryEvent_3'),
              host = elementRegistry.get('Task_3');

          // when
          modeling.moveElements([ element ], { x: -50, y: -50 }, host, ATTACH);

          // then
          expectLabelOrientation(element, 'left');
        }
      ));


      it('should move label to the top', inject(
        function(elementRegistry, modeling) {

          // given
          var element = elementRegistry.get('BoundaryEvent_3'),
              host = elementRegistry.get('Task_3');

          // when
          modeling.moveElements([ element ], { x: 50, y: -80 }, host, ATTACH); // top-right corner

          // then
          expectLabelOrientation(element, 'top');
        }
      ));

    });

  });


  describe('integration', function() {

    describe('copy and paste', function() {

      var diagramXML = require('./AdaptiveLabelPositioningBehavior.basics.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should NOT adjust on paste', inject(
        function(canvas, copyPaste, elementRegistry, modeling) {

          // given
          var exclusiveGateway = elementRegistry.get('ExclusiveGateway_1'),
              endEvent = elementRegistry.get('EndEvent_1');

          var moveShapeSpy = sinon.spy(modeling, 'moveShape');

          // when
          copyPaste.copy([ exclusiveGateway, endEvent ]);

          copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: 1000,
              y: 1000
            }
          });

          // then
          expect(moveShapeSpy).not.to.have.been.called;
        })
      );

    });

  });

});
