'use strict';

var Helper = require('./Helper');

/* global bootstrapModeler, inject */

var move = Helper.move,
    expectZOrder = Helper.expectZOrder;

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - ordering', function() {

  var diagramXML = require('./ordering.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should keep Task behind BoundaryEvent', inject(function() {

    // when
    move('Task_With_Boundary');

    // then
    expectZOrder('Task_With_Boundary', 'BoundaryEvent');
  }));


  it('should keep Task behind BoundaryEvent, moving both', inject(function() {

    // when
    move([ 'BoundaryEvent', 'Task_With_Boundary' ], 'Participant_StartEvent');

    // then
    expectZOrder('Task_With_Boundary', 'BoundaryEvent');
  }));


  it('should keep Participant behind MessageFlow', inject(function() {

    // when
    move('Participant', 'Collaboration');

    // then
    expectZOrder('Participant_StartEvent', 'Participant', 'MessageFlow');
  }));

});