'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var autoResizeModule = require('../../../../lib/features/auto-resize'),
    modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('diagram-js/lib/features/create'),
    coreModule = require('../../../../lib/core');

function getBounds(shape) {
  return pick(shape, ['x', 'y', 'width', 'height']);
}

describe('features/auto-resize', function() {

  var testModules = [coreModule, modelingModule, autoResizeModule, createModule ];

  var diagramXML = require('./AutoResize.collaboration.bpmn');

  var task,
      participant,
      startEvent,
      expectedBounds;

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  beforeEach(inject(function(elementRegistry) {

    task = elementRegistry.get('Task_1');
    participant = elementRegistry.get('Participant_1');
    startEvent = elementRegistry.get('StartEvent_1');

    expectedBounds = getBounds(participant);

    expect(expectedBounds).to.eql({ x: 247, y: 160, width: 371, height: 178 });

  }));

  describe('after moving', function() {

    it('should expand the right edge of the parent collaboration',
        inject(function(modeling) {

      // when
      modeling.moveElements([task], { x: 100, y: 0 }, participant);

      // then
      assign(expectedBounds, { width: 525 });

      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should expand the top edge of the parent collaboration',
        inject(function(modeling) {

      // when
      modeling.moveElements([task], { x: 0, y: -50 }, participant);

      // then
      assign(expectedBounds, { y: 79, height: 259 });

      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should expand the bottom edge of the parent collaboration',
        inject(function(modeling) {

      // when
      modeling.moveElements([task], { x: 0, y: 50 }, participant);

      // then
      assign(expectedBounds, { height: 259 });

      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should expand the left edge of the parent collaboration',
        inject(function(modeling) {

      // when
      modeling.moveElements([startEvent], { x: -100, y: 0 }, participant);

      // then
      assign(expectedBounds, { x: 122, width: 496 });

      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should expand the bottom right edges of the parent collaboration',
        inject(function(modeling) {

      // when
      modeling.moveElements([task], { x: 50, y: 50 }, participant);

      // then
      assign(expectedBounds, { width: 475, height: 259 });

      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should expand the top left edges of the parent collaboration',
        inject(function(modeling) {

      // when
      modeling.moveElements([startEvent], { x: -100, y: -100 }, participant);

      // then
      expect(getBounds(participant)).to.eql({ x: 122, y: 51, width: 496, height: 287 });

    }));


    it('should not resize the parent collaboration if element is placed too far outside',
        inject(function(modeling) {

      // when
      modeling.moveElements([task], { x: 300, y: 0 }, participant);

      // then
      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should undo resizing', inject(function(modeling, commandStack) {

      // when
      modeling.moveElements([startEvent], { x: -100, y: -100 }, participant);
      commandStack.undo();

      // then
      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should redo resizing', inject(function(modeling, commandStack) {

      // when
      modeling.moveElements([startEvent], { x: -100, y: -100 }, participant);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(getBounds(participant)).to.eql({ x: 122, y: 51, width: 496, height: 287 });

    }));

  });

  describe('after appending', function(){


    it('should expand the bottom right edges of the parent collaboration',
        inject(function(modeling) {

      // when
      modeling.appendShape(task, { type: 'bpmn:Task' }, { x: 660, y: 350 }, participant);

      // then
      assign(expectedBounds, { width: 563, height: 310 });

      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should undo resizing', inject(function(modeling, commandStack) {
      // given
      modeling.appendShape(task, { type: 'bpmn:Task' }, { x: 660, y: 250 }, participant);

      // when
      commandStack.undo();

      // then
      expect(getBounds(participant)).to.eql(expectedBounds);

    }));


    it('should redo resizing and restore shapes and connections',
      inject(function(modeling, commandStack) {

      // given
      var task2 = modeling.appendShape(task, { type: 'bpmn:Task' }, { x: 660, y: 250 }, participant);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      assign(expectedBounds, { width: 563 });

      expect(getBounds(participant)).to.eql(expectedBounds);

      expect(task2).to.be.defined;
      expect(task.outgoing).not.to.be.empty;
      expect(task2.incoming).not.to.be.empty;

    }));

  });

});
