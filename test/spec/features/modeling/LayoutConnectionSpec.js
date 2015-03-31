'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - layout connection', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = require('../../../fixtures/bpmn/sequence-flows.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('connection handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      // when
      modeling.layoutConnection(sequenceFlowConnection);

      // then

      // expect cropped, repaired connection
      expect(sequenceFlowConnection.waypoints).toDeepEqual([
        { original: { x: 553, y: 341 }, x: 578, y: 341 },
        { x: 934, y: 341 },
        { x: 934, y: 436 },
        { original: { x: 832, y: 436 }, x: 832, y: 436 }
      ]);

      // expect cropped waypoints in di
      expect(sequenceFlow.di.waypoint).toDeepEqual([
        { $type: 'dc:Point', x: 578, y: 341 },
        { $type: 'dc:Point', x: 934, y: 341 },
        { $type: 'dc:Point', x: 934, y: 436 },
        { $type: 'dc:Point', x: 832, y: 436 }
      ]);
    }));

  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      var oldWaypoints = sequenceFlowConnection.waypoints,
          oldDiWaypoints = sequenceFlow.di.waypoint;

      modeling.layoutConnection(sequenceFlowConnection);

      // when
      commandStack.undo();

      // then
      expect(sequenceFlowConnection.waypoints).toDeepEqual(oldWaypoints);
      expect(sequenceFlow.di.waypoint).toDeepEqual(oldDiWaypoints);
    }));

  });


  describe('redo support', function() {

    it('should redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      modeling.layoutConnection(sequenceFlowConnection);

      var newWaypoints = sequenceFlowConnection.waypoints,
          newDiWaypoints = sequenceFlow.di.waypoint;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sequenceFlowConnection.waypoints).toDeepEqual(newWaypoints);
      expect(sequenceFlow.di.waypoint).toDeepEqual(newDiWaypoints);
    }));

  });

});