import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import Modeler from 'lib/Modeler';

import {
  createCanvasEvent as canvasEvent
} from '../util/MockEvents';


import customElementsModules from './custom-elements';

var noTouchInteractionModule = { touchInteractionEvents: ['value', null ] },
    modelerModules = Modeler.prototype._modules,
    customModules = [ customElementsModules, noTouchInteractionModule ];

var testModules = [].concat(modelerModules, customModules);

var processDiagramXML = require('../fixtures/bpmn/simple.bpmn');

var collaborationDiagramXML = require('../fixtures/bpmn/collaboration.bpmn');


describe('custom elements', function() {

  describe('renderer', function() {

    beforeEach(bootstrapModeler(processDiagramXML, {
      modules: testModules
    }));


    var triangle, circle;

    beforeEach(inject(function(elementFactory, canvas) {
      triangle = elementFactory.createShape({
        id: 'triangle',
        type: 'custom:triangle',
        x: 700, y: 100
      });

      canvas.addShape(triangle);

      circle = elementFactory.createShape({
        id: 'circle',
        type: 'custom:circle',
        x: 800, y: 100
      });

      canvas.addShape(circle);
    }));


    it('should render custom elements', inject(function(elementRegistry) {

      // when

      // then
      expect(elementRegistry.get('triangle')).to.eql(triangle);
      expect(elementRegistry.get('circle')).to.eql(circle);
    }));


    it('should get the correct custom elements path', inject(function(graphicsFactory) {

      // when
      var trianglePath = graphicsFactory.getShapePath(triangle),
          circlePath = graphicsFactory.getShapePath(circle);

      // then
      expect(trianglePath).to.equal('M720,100l20,40l-40,0z');
      expect(circlePath).to.equal('M870,170m0,-70a70,70,0,1,1,0,140a70,70,0,1,1,0,-140z');
    }));


    it('should still render bpmn elements', inject(function(elementFactory) {

      // when
      var startEvent = elementFactory.createShape({ type: 'bpmn:StartEvent' });

      // then
      expect(startEvent.businessObject.$type).to.equal('bpmn:StartEvent');
    }));

  });


  describe('integration', function() {

    describe('process diagram', function() {

      beforeEach(bootstrapModeler(processDiagramXML, {
        modules: testModules
      }));


      var triangle, circle;

      beforeEach(inject(function(elementFactory, canvas) {

        circle = elementFactory.createShape({
          id: 'circle',
          type: 'custom:circle',
          x: 800, y: 100
        });

        canvas.addShape(circle);

        triangle = elementFactory.createShape({
          id: 'triangle',
          type: 'custom:triangle',
          x: 700, y: 100
        });

        canvas.addShape(triangle);
      }));


      it('should allow moving a custom shape inside another one',
        inject(function(elementFactory, elementRegistry, dragging, move) {

          // given
          var circleGfx = elementRegistry.getGraphics(circle);

          // when
          move.start(canvasEvent({ x: 0, y: 0 }), triangle);

          dragging.move(canvasEvent({ x: 100, y: 0 }));
          dragging.hover({ element: circle, gfx: circleGfx });
          dragging.move(canvasEvent({ x: 150, y: 50 }));

          dragging.end();

          // then
          expect(triangle.parent).to.equal(circle);
        })
      );


      it('should update the custom shape properties',
        inject(function(elementFactory, elementRegistry, dragging, move) {

          // given
          var circleGfx = elementRegistry.getGraphics(circle);

          // when
          move.start(canvasEvent({ x: 0, y: 0 }), triangle);

          dragging.move(canvasEvent({ x: 100, y: 0 }));
          dragging.hover({ element: circle, gfx: circleGfx });
          dragging.move(canvasEvent({ x: 150, y: 50 }));

          dragging.end();

          // then
          expect(triangle.businessObject.leader).to.equal(circle);
          expect(circle.businessObject.companions).to.include(triangle);
        })
      );


      it('should not connect a bpmn element to a custom one',
        inject(function(elementFactory, dragging, elementRegistry, connect) {

          // given
          var subProcess = elementRegistry.get('SubProcess_1'),
              triangleGfx = elementRegistry.getGraphics(triangle);

          // when
          connect.start(canvasEvent({ x: 590, y: 90 }), subProcess);

          dragging.move(canvasEvent({ x: 700, y: 100 }));
          dragging.hover({ element: triangle, gfx: triangleGfx });
          dragging.move(canvasEvent({ x: 715, y: 115 }));

          dragging.end();

          // then
          expect(triangle.incoming).to.have.lengthOf(0);
        })
      );

    });


    describe('collaboration diagram', function() {

      beforeEach(bootstrapModeler(collaborationDiagramXML, {
        modules: testModules
      }));


      var triangle;

      beforeEach(inject(function(elementFactory, canvas) {

        triangle = elementFactory.createShape({
          id: 'triangle',
          type: 'custom:triangle',
          x: 700, y: 100
        });

        canvas.addShape(triangle);
      }));


      it('should update parent when removing collaboration',
        inject(function(elementRegistry, modeling, canvas) {

          // given
          var customTriangle = elementRegistry.get('triangle');

          // when
          modeling.removeElements([
            elementRegistry.get('Participant_1'),
            elementRegistry.get('Participant_2')
          ]);

          // then
          expect(customTriangle.parent).to.eql(canvas.getRootElement());
        })
      );

    });

  });

});
