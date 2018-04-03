import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - reconnect connection', function() {

  var testModules = [ coreModule, modelingModule ];

  var processDiagramXML = require('./ReconnectConnection.data-association.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

  var task1Shape,
      task2Shape,
      dataInputAssociation,
      dataOutputAssociation,
      newWaypoints;

  beforeEach(inject(function(elementRegistry) {
    task1Shape = elementRegistry.get('Task_1');
    task2Shape = elementRegistry.get('Task_2');
    dataInputAssociation = elementRegistry.get('DataInputAssociation_1');
    dataOutputAssociation = elementRegistry.get('DataOutputAssociation_1');
  }));


  describe('reconnect DataOutputAssociations', function() {

    beforeEach(function() {
      newWaypoints = [{ x: task2Shape.x, y: task2Shape.y+30 }, dataOutputAssociation.waypoints[1]];
    });

    it('should execute', inject(function(modeling) {

      // when
      modeling.reconnectStart(dataOutputAssociation, task2Shape, newWaypoints);

      // then
      expect(task1Shape.businessObject.dataOutputAssociations).to.be.empty;
      expect(task2Shape.businessObject.dataOutputAssociations).to.include(dataOutputAssociation.businessObject);

    }));


    it('should undo', inject(function(modeling, commandStack) {

      // when
      modeling.reconnectStart(dataOutputAssociation, task2Shape, newWaypoints);
      commandStack.undo();

      // then
      expect(task1Shape.businessObject.dataOutputAssociations).to.include(dataOutputAssociation.businessObject);
      expect(task2Shape.businessObject.dataOutputAssociations).to.be.empty;

    }));


    it('should redo', inject(function(modeling, commandStack) {

      // when
      modeling.reconnectStart(dataOutputAssociation, task2Shape, newWaypoints);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(task1Shape.businessObject.dataOutputAssociations).to.be.empty;
      expect(task2Shape.businessObject.dataOutputAssociations).to.include(dataOutputAssociation.businessObject);

    }));
  });

  describe('reconnect DataInputAssociations', function() {

    beforeEach(function() {
      newWaypoints = [dataInputAssociation.waypoints[0], { x: task1Shape.x, y: task1Shape.y-30 }];
    });

    it('should execute', inject(function(modeling) {

      // when
      modeling.reconnectEnd(dataInputAssociation, task1Shape, newWaypoints);

      // then
      expect(task1Shape.businessObject.dataInputAssociations).to.include(dataInputAssociation.businessObject);
      expect(task2Shape.businessObject.dataInputAssociations).to.be.empty;
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // when
      modeling.reconnectEnd(dataInputAssociation, task1Shape, newWaypoints);
      commandStack.undo();

      // then
      expect(task1Shape.businessObject.dataInputAssociations).to.be.empty;
      expect(task2Shape.businessObject.dataInputAssociations).to.include(dataInputAssociation.businessObject);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // when
      modeling.reconnectEnd(dataInputAssociation, task1Shape, newWaypoints);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(task1Shape.businessObject.dataInputAssociations).to.include(dataInputAssociation.businessObject);
      expect(task2Shape.businessObject.dataInputAssociations).to.be.empty;
    }));
  });

});
