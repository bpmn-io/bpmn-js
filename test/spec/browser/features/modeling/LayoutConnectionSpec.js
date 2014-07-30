'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapBpmnJS, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../../lib/features/modeling'),
    drawModule = require('../../../../../lib/draw');


describe('features/modeling - layout connection', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/sequence-flows.bpmn', 'utf-8');

  var testModules = [ drawModule, modelingModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('connection handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.getById('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;


      // when
      modeling.layoutConnection(sequenceFlowConnection);

      // then

      // expect cropped connection
      expect(sequenceFlowConnection.waypoints).toDeepEqual([
        { original: { x: 553, y: 341 }, x: 571, y: 348 },
        { original: { x: 782, y: 436 }, x: 732, y: 415 }
      ]);

      // expect cropped waypoints in di
      expect(sequenceFlow.di.waypoint).toDeepEqual([
        { $type: 'dc:Point', x: 571, y: 348 },
        { $type: 'dc:Point', x: 732, y: 415 }
      ]);
    }));

  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.getById('SequenceFlow_1'),
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
      var sequenceFlowConnection = elementRegistry.getById('SequenceFlow_1'),
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