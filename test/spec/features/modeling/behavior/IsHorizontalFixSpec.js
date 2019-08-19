import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import { getBusinessObject } from 'lib/util/ModelUtil';


describe('features/modeling/behavior - IsHorizontalFix', function() {

  var diagramXML;


  describe('set on create', function() {

    diagramXML = require('test/fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('should set isHorizontal=true when participant is created',
      inject(function(canvas, elementFactory, modeling) {

        // given
        var processShape = canvas.getRootElement(),
            participantShape = elementFactory.createParticipantShape(true);

        // when
        var participant = modeling.createShape(participantShape, { x: 350, y: 200 }, processShape);

        // then
        var isHorizontal = getBusinessObject(participant).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should set isHorizontal=true when lane is created',
      inject(function(canvas, elementFactory, modeling) {

        // given
        var processShape = canvas.getRootElement(),
            participantShape = elementFactory.createParticipantShape(true),
            participant = modeling.createShape(participantShape, { x: 350, y: 200 }, processShape);

        // when
        var lane = modeling.addLane(participant, 'bottom');

        // then
        var isHorizontal = getBusinessObject(lane).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );

  });


  describe('set on change', function() {

    diagramXML = require('./IsHorizontalFix.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('should set isHorizontal=true when participant is moved',
      inject(function(elementRegistry, modeling) {

        // given
        var participant = elementRegistry.get('Participant');

        // when
        modeling.moveElements([ participant ], { x: 0, y: 0 });

        // then
        var isHorizontal = getBusinessObject(participant).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should set isHorizontal=true when lane is moved',
      inject(function(elementRegistry, modeling) {

        // given
        var lane = elementRegistry.get('Lane');

        // when
        modeling.moveElements([ lane ], { x: 0, y: 0 });

        // then
        var isHorizontal = getBusinessObject(lane).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should set isHorizontal=true when participant is resized',
      inject(function(elementRegistry, modeling) {

        // given
        var participant = elementRegistry.get('Participant');

        // when
        modeling.resizeShape(participant, { x: 0, y: 0, width: 10, height: 10 });

        // then
        var isHorizontal = getBusinessObject(participant).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should set isHorizontal=true when lane is resized',
      inject(function(elementRegistry, modeling) {

        // given
        var lane = elementRegistry.get('Lane');

        // when
        modeling.resizeLane(lane, { x: 0, y: 0, width: 10, height: 10 });

        // then
        var isHorizontal = getBusinessObject(lane).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );

  });


  describe('never unset on revert', function() {

    diagramXML = require('./IsHorizontalFix.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('should not unset isHorizontal=true when participant move action is reverted',
      inject(function(commandStack, elementRegistry, modeling) {

        // given
        var participant = elementRegistry.get('Participant');

        modeling.moveElements([ participant ], { x: 0, y: 0 });

        // when
        commandStack.undo();

        // then
        var isHorizontal = getBusinessObject(participant).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should not unset isHorizontal=true when lane move action is reverted',
      inject(function(commandStack, elementRegistry, modeling) {

        // given
        var lane = elementRegistry.get('Lane');

        modeling.moveElements([ lane ], { x: 0, y: 0 });

        // when
        commandStack.undo();

        // then
        var isHorizontal = getBusinessObject(lane).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should not unset isHorizontal=true when participant resize action is reverted',
      inject(function(commandStack, elementRegistry, modeling) {

        // given
        var participant = elementRegistry.get('Participant');

        modeling.resizeShape(participant, { x: 0, y: 0, width: 10, height: 10 });

        // when
        commandStack.undo();

        // then
        var isHorizontal = getBusinessObject(participant).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should not unset isHorizontal=true when lane resize action is reverted',
      inject(function(commandStack, elementRegistry, modeling) {

        // given
        var lane = elementRegistry.get('Lane');

        modeling.resizeLane(lane, { x: 0, y: 0, width: 10, height: 10 });

        // when
        commandStack.undo();

        // then
        var isHorizontal = getBusinessObject(lane).di.get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );

  });

});
