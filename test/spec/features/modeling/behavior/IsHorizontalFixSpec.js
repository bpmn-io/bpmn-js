import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import modelingModule from 'bpmn-js/lib/features/modeling';
import coreModule from 'bpmn-js/lib/core';

import { getDi } from 'bpmn-js/lib/util/ModelUtil.js';

import simpleXML from 'bpmn-js/test/fixtures/bpmn/simple.bpmn';
import basicXML from './IsHorizontalFix.bpmn';


describe('features/modeling/behavior - IsHorizontalFix', function() {

  describe('set on create', function() {

    beforeEach(bootstrapModeler(simpleXML, {
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
        var isHorizontal = getDi(participant).get('isHorizontal');

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
        var isHorizontal = getDi(lane).get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );

  });


  describe('set on change', function() {

    beforeEach(bootstrapModeler(basicXML, {
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
        var isHorizontal = getDi(participant).get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should keep isHorizontal=true when participant is moved',
      inject(function(elementRegistry, modeling) {

        // given
        var participant = elementRegistry.get('Horizontal_Participant');

        // when
        modeling.moveElements([ participant ], { x: 0, y: 0 });

        // then
        var isHorizontal = getDi(participant).get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should keep isHorizontal=false when participant is moved',
      inject(function(elementRegistry, modeling) {

        // given
        var participant = elementRegistry.get('Vertical_Participant');

        // when
        modeling.moveElements([ participant ], { x: 0, y: 0 });

        // then
        var isHorizontal = getDi(participant).get('isHorizontal');

        expect(isHorizontal).to.be.false;
      })
    );


    it('should set isHorizontal=true when lane is moved',
      inject(function(elementRegistry, modeling) {

        // given
        var lane = elementRegistry.get('Lane');

        // when
        modeling.moveElements([ lane ], { x: 0, y: 0 });

        // then
        var isHorizontal = getDi(lane).get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should keep isHorizontal=true when lane is moved',
      inject(function(elementRegistry, modeling) {

        // given
        var lane = elementRegistry.get('Horizontal_Lane');

        // when
        modeling.moveElements([ lane ], { x: 0, y: 0 });

        // then
        var isHorizontal = getDi(lane).get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );


    it('should keep isHorizontal=false when lane is moved',
      inject(function(elementRegistry, modeling) {

        // given
        var lane = elementRegistry.get('Vertical_Lane');

        // when
        modeling.moveElements([ lane ], { x: 0, y: 0 });

        // then
        var isHorizontal = getDi(lane).get('isHorizontal');

        expect(isHorizontal).to.be.false;
      })
    );


    it('should set isHorizontal=true when participant is resized',
      inject(function(elementRegistry, modeling) {

        // given
        var participant = elementRegistry.get('Participant');

        // when
        modeling.resizeShape(participant, { x: 0, y: 0, width: 10, height: 10 });

        // then
        var isHorizontal = getDi(participant).get('isHorizontal');

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
        var isHorizontal = getDi(lane).get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );

  });


  describe('never unset on revert', function() {

    beforeEach(bootstrapModeler(basicXML, {
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
        var isHorizontal = getDi(participant).get('isHorizontal');

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
        var isHorizontal = getDi(lane).get('isHorizontal');

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
        var isHorizontal = getDi(participant).get('isHorizontal');

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
        var isHorizontal = getDi(lane).get('isHorizontal');

        expect(isHorizontal).to.be.true;
      })
    );

  });

});
