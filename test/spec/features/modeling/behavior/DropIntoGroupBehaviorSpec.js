import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import moveModule from 'diagram-js/lib/features/move';
import modelingModule from 'lib/features/modeling';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';


describe('modeling/behavior - drop into group', function() {

  var diagramXML = require('./DropIntoGroupBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      moveModule,
      modelingModule,
      coreModule
    ]
  }));


  describe('execution', function() {

    describe('create', function() {

      it('should drop shape into group', inject(
        function(modeling, elementRegistry, elementFactory) {

          // given
          var intermediateThrowEvent = elementFactory.createShape({
            type: 'bpmn:IntermediateThrowEvent'
          });

          var group = elementRegistry.get('Group_1');

          var dropPosition = { x: 300, y: 100 };

          // when
          var newShape = modeling.createShape(
            intermediateThrowEvent,
            dropPosition,
            group
          );

          // then
          expect(newShape).to.exist;
          expect(isPointInsideBBox(group, newShape));
          expect(newShape.parent).to.not.eql(group);
          expect(newShape.parent).to.eql(group.parent);
        }
      ));

    });


    describe('move', function() {

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));

      it('should drop shape into group', inject(
        function(dragging, move, elementRegistry, selection) {

          // given
          var startEvent = elementRegistry.get('StartEvent_1');

          var group = elementRegistry.get('Group_1'),
              groupGfx = elementRegistry.getGraphics(group);

          // when

          selection.select(startEvent);

          move.start(canvasEvent({ x: 0, y: 0 }), startEvent);

          dragging.hover({
            element: group,
            gfx: groupGfx
          });

          dragging.move(canvasEvent({ x: 100, y: 0 }));
          dragging.end();

          // then
          // todo(pinussilvestrus): expect to be inside group bounds
          expect(isPointInsideBBox(group, startEvent));
          expect(startEvent.parent).to.not.eql(group);
          expect(startEvent.parent).to.eql(group.parent);
        }
      ));

    });

  });

});


// helpers /////////////////////

function isPointInsideBBox(bbox, point) {
  var x = point.x,
      y = point.y;

  return x >= bbox.x &&
      x <= bbox.x + bbox.width &&
      y >= bbox.y &&
      y <= bbox.y + bbox.height;
}
