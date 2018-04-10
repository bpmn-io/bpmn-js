import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import replacePreviewModule from 'lib/features/replace-preview';
import moveModule from 'diagram-js/lib/features/move';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import {
  assign
} from 'min-dash';

import {
  attr as svgAttr,
  clone as svgClone,
  innerSVG
} from 'tiny-svg';


describe('features/replace-preview', function() {

  var diagramXML = require('./BpmnReplacePreview.bpmn');

  var startEvent1,
      rootElement;

  var getGfx,
      moveShape;

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      replacePreviewModule,
      moveModule,
      modelingModule,
      coreModule
    ]
  }));

  beforeEach(inject(function(canvas, elementRegistry, elementFactory, move, dragging) {

    startEvent1 = elementRegistry.get('StartEvent.1');
    rootElement = canvas.getRootElement();

    /**
     * returns the gfx representation of an element type
     *
     * @param  {Object} elementData
     *
     * @return {Object}
     */
    getGfx = function(elementData) {
      assign(elementData, { x: 0, y: 0 });

      var tempShape = elementFactory.createShape(elementData);

      canvas.addShape(tempShape, rootElement);

      var gfx = svgClone(elementRegistry.getGraphics(tempShape));

      canvas.removeShape(tempShape);

      return gfx;
    };

    moveShape = function(shape, target, position) {
      var startPosition = {
        x: shape.x + 10 + (shape.width / 2),
        y: shape.y + 30 + (shape.height / 2)
      };

      move.start(canvasEvent(startPosition), shape);

      dragging.hover({
        element: target,
        gfx: elementRegistry.getGraphics(target)
      });

      dragging.move(canvasEvent(position));
    };

  }));


  it('should draw replaced visuals at correct position', inject(function(dragging) {

    // when
    moveShape(startEvent1, rootElement, { x: 280, y: 120 });

    // then
    var dragGroup = dragging.context().data.context.dragGroup;

    svgAttr(dragGroup.childNodes[0], 'display', 'inline');

    expect(dragGroup.childNodes[0].getBBox()).to.eql(dragGroup.childNodes[1].getBBox());
  }));


  it('should add dragger to context.visualReplacements once', inject(function(dragging) {

    // when
    moveShape(startEvent1, rootElement, { x: 275, y: 120 });
    moveShape(startEvent1, rootElement, { x: 280, y: 120 });
    moveShape(startEvent1, rootElement, { x: 285, y: 120 });

    // then
    var visualReplacements = dragging.context().data.context.visualReplacements;

    expect(visualReplacements[startEvent1.id]).to.exist;
    expect(Object.keys(visualReplacements).length).to.equal(1);

  }));


  it('should remove dragger from context.visualReplacements', inject(
    function(elementRegistry, dragging) {

      // given
      var subProcess2 = elementRegistry.get('SubProcess_2');

      // when
      moveShape(startEvent1, rootElement, { x: 275, y: 120 });
      moveShape(startEvent1, rootElement, { x: 280, y: 120 });
      moveShape(startEvent1, subProcess2, { x: 350, y: 120 });

      // then
      var visualReplacements = dragging.context().data.context.visualReplacements;

      expect(visualReplacements).to.be.empty;
    }
  ));


  it('should hide the replaced visual', inject(function(dragging) {

    // when
    moveShape(startEvent1, rootElement, { x: 280, y: 120 });

    // then
    var dragGroup = dragging.context().data.context.dragGroup;

    expect(svgAttr(dragGroup.childNodes[0], 'display')).to.equal('none');
  }));


  it('should not replace non-interrupting start event while hover over same event sub process',
    inject(function(dragging, elementRegistry) {

      // given
      var subProcess1 = elementRegistry.get('SubProcess.1');

      // when
      moveShape(startEvent1, subProcess1, { x: 210, y: 180 });

      var context = dragging.context().data.context;

      // then
      // check if the visual representation remains a non interrupting message start event
      var startEventGfx = getGfx({
        type: 'bpmn:StartEvent',
        isInterrupting: false,
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });

      expect(innerSVG(context.dragGroup.childNodes[0])).to.equal(innerSVG(startEventGfx));
    })
  );


  it('should replace non-interrupting start event while hover over root element',
    inject(function(dragging, elementRegistry) {

      // when
      moveShape(startEvent1, rootElement, { x: 280, y: 120 });

      var context = dragging.context().data.context;

      // then
      // check if the visual replacement is a blank interrupting start event
      var startEventGfx = getGfx({ type: 'bpmn:StartEvent' });

      expect(innerSVG(context.dragGroup.childNodes[1])).to.equal(innerSVG(startEventGfx));
    })
  );


  it('should not replace non-interrupting start event while hover over another event sub process',
    inject(function(dragging, elementRegistry) {

      // given
      var subProcess2 = elementRegistry.get('SubProcess_2');

      // when
      moveShape(startEvent1, subProcess2, { x: 350, y: 120 });

      var context = dragging.context().data.context;

      // then
      // check if the visual representation remains a non interrupting message start event
      var startEventGfx = getGfx({
        type: 'bpmn:StartEvent',
        isInterrupting: false,
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });

      expect(innerSVG(context.dragGroup.childNodes[0])).to.equal(innerSVG(startEventGfx));
    })
  );


  it('should replace non-interrupting start event while hover over regular sub process',
    inject(function(dragging, elementRegistry) {

      // given
      var subProcess3 = elementRegistry.get('SubProcess_3');

      // when
      moveShape(startEvent1, subProcess3, { x: 600, y: 120 });

      var context = dragging.context().data.context;

      // then
      // check if the visual representation remains a non interrupting message start event
      var startEventGfx = getGfx({ type: 'bpmn:StartEvent' });

      expect(innerSVG(context.dragGroup.childNodes[1])).to.equal(innerSVG(startEventGfx));
    })
  );


  it('should replace all non-interrupting start events in a selection of multiple elements',
    inject(function(move, dragging, elementRegistry, selection) {

      // given
      var startEvent2 = elementRegistry.get('StartEvent.2'),
          startEvent3 = elementRegistry.get('StartEvent.3');

      // when
      selection.select([ startEvent1, startEvent2, startEvent3 ]);

      moveShape(startEvent1, rootElement, { x: 150, y: 250 });

      var context = dragging.context().data.context;

      // then
      // check if the visual replacements are blank interrupting start events
      var startEventGfx = getGfx({ type: 'bpmn:StartEvent' });

      expect(innerSVG(context.dragGroup.childNodes[1])).to.equal(innerSVG(startEventGfx));
      expect(innerSVG(context.dragGroup.childNodes[3])).to.equal(innerSVG(startEventGfx));
      expect(innerSVG(context.dragGroup.childNodes[4])).to.equal(innerSVG(startEventGfx));
    })
  );


  it('should not replace any non-interrupting start events in a selection of multiple elements',
    inject(function(move, dragging, elementRegistry, selection) {

      // given
      var startEvent2 = elementRegistry.get('StartEvent.2'),
          startEvent3 = elementRegistry.get('StartEvent.3'),
          subProcess2 = elementRegistry.get('SubProcess_2');

      var messageStartEventGfx = getGfx({
        type: 'bpmn:StartEvent',
        isInterrupting: false,
        eventDefinitionType: 'bpmn:MessageEventDefinition'
      });

      var timerStartEventGfx = getGfx({
        type: 'bpmn:StartEvent',
        isInterrupting: false,
        eventDefinitionType: 'bpmn:TimerEventDefinition'
      });

      var startEventGfx = getGfx({ type: 'bpmn:StartEvent' });

      // when
      selection.select([ startEvent1, startEvent2, startEvent3 ]);

      moveShape(startEvent1, subProcess2, { x: 350, y: 120 });

      var context = dragging.context().data.context;

      // then
      expect(innerSVG(context.dragGroup.childNodes[0])).to.equal(innerSVG(messageStartEventGfx));
      expect(innerSVG(context.dragGroup.childNodes[1])).to.equal(innerSVG(startEventGfx));
      expect(innerSVG(context.dragGroup.childNodes[2])).to.equal(innerSVG(timerStartEventGfx));
    })
  );


  it('should not throw TypeError when moving boundaryEvent',
    inject(function(move, dragging, elementRegistry, elementFactory, selection, modeling) {

      // given
      var startEvent1 = elementRegistry.get('StartEvent.1'),
          subProcess3 = elementRegistry.get('SubProcess_3');

      var intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

      var boundaryEvent = modeling.createShape(
        intermediateEvent,
        { x: 550, y: 180 },
        subProcess3,
        true
      );

      // when
      selection.select([ startEvent1 ]);

      moveShape(boundaryEvent, subProcess3, { x: 580, y: 210 });
      moveShape(boundaryEvent, subProcess3, { x: 580, y: 180 });

      // then
      // expect not to throw TypeError: Cannot read property 'oldElementId' of undefined
    })
  );

});
