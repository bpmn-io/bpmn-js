'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - layout message flows', function() {

  var diagramXML = require('../../../../fixtures/bpmn/collaboration-message-flows.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should layout manhattan after Task move', inject(function(elementRegistry, modeling) {

    // given
    var taskShape = elementRegistry.get('Task_1'),
        messageFlowConnection = elementRegistry.get('MessageFlow_4');

    // when
    modeling.moveElements([ taskShape ], { x: 30, y: 20 });

    // then
    // expect cropped, repaired manhattan connection
    expect(messageFlowConnection.waypoints).eql([
      { original: { x: 420, y: 234 }, x: 420, y: 234 },
      { x: 420, y: 387 },
      { x: 318, y: 387 },
      { original: { x: 318, y: 448 }, x: 318, y: 448 }
    ]);
  }));


  it('should layout straight after Task move', inject(function(elementRegistry, modeling) {

    // given
    var taskShape = elementRegistry.get('Task_2'),
        messageFlowConnection = elementRegistry.get('MessageFlow_1');

    // when
    modeling.moveElements([ taskShape ], { x: 20, y: -20 });

    // then

    // expect cropped, repaired manhattan connection
    expect(messageFlowConnection.waypoints).eql([
      { original: { x: 610, y: 194 }, x: 610, y: 194 },
      { original: { x: 610, y: 415 }, x: 610, y: 415 }
    ]);
  }));


  it('should layout straight after Participant move', inject(function(elementRegistry, modeling) {

    // given
    var participantShape = elementRegistry.get('Participant_1'),
        messageFlowConnection = elementRegistry.get('MessageFlow_5');

    // when
    modeling.moveElements([ participantShape ], { x: 100, y: 50 });

    // then

    // expect cropped, repaired manhattan connection
    expect(messageFlowConnection.waypoints).eql([
      { original: { x: 671, y: 214 }, x: 671, y: 214 },
      { original: { x: 671, y: 465 }, x: 671, y: 465 }
    ]);
  }));


  it('should layout manhattan after Participant move beyond EndEvent bounds',
      inject(function(elementRegistry, modeling) {

    // given
    var participantShape = elementRegistry.get('Participant_1'),
        messageFlowConnection = elementRegistry.get('MessageFlow_5');

    // when
    modeling.moveElements([ participantShape ], { x: -200, y: 0 });

    // then

    // expect cropped, repaired manhattan connection
    expect(messageFlowConnection.waypoints).eql([
      { original: { x: 671, y: 214 }, x: 671, y: 214 },
      { x: 671, y: 315 },
      { x: 471, y: 315 },
      { original: { x: 471, y: 415 }, x: 471, y: 415 }
    ]);
  }));

});
