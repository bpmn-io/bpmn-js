import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - remove element behavior', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('combine sequence flow when deleting element', function() {


    describe('parallel connections', function() {

      var processDiagramXML = require('./RemoveElementBehavior.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


      it('horizontal', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task1');

        // when
        modeling.removeShape(task);

        // then
        var sequenceFlow1 = elementRegistry.get('SequenceFlow1');
        var waypoints = sequenceFlow1.waypoints;

        // SequenceFlow2 should be deleted
        expect(elementRegistry.get(task.id)).to.be.undefined;
        expect(sequenceFlow1).not.to.be.undefined;
        expect(elementRegistry.get('SequenceFlow2')).to.be.undefined;

        // source and target have one connection each
        expect(elementRegistry.get('StartEvent1').outgoing.length).to.be.equal(1);
        expect(elementRegistry.get('EndEvent1').incoming.length).to.be.equal(1);

        // connection has two horizontally equal waypoints
        expect(waypoints).to.have.length(2);
        expect(waypoints[0].y).to.eql(waypoints[1].y);

      }));


      it('vertical', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task4');

        // when
        modeling.removeShape(task);

        // then
        var waypoints = elementRegistry.get('SequenceFlow7').waypoints;

        // connection has two vertically equal waypoints
        expect(waypoints).to.have.length(2);
        expect(waypoints[0].x).to.eql(waypoints[1].x);

      }));

    });


    describe('perpendicular connections', function() {

      var gatewayDiagramXML = require('./RemoveElementBehavior.perpendicular.bpmn');

      beforeEach(bootstrapModeler(gatewayDiagramXML, { modules: testModules }));


      it('right-down', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_2');
        var mid = {
          x : task.x + task.width / 2,
          y : task.y + task.height / 2
        };

        // when
        modeling.removeShape(task);

        // then
        var waypoints = elementRegistry.get('SequenceFlow_1').waypoints;
        expect(waypoints).to.have.length(3);

        var intersec = waypoints[1];
        expect(intersec).to.eql(point(mid));

      }));


      it('right-up', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_11');
        var mid = {
          x : task.x + task.width / 2,
          y : task.y + task.height / 2
        };

        // when
        modeling.removeShape(task);

        // then
        var waypoints = elementRegistry.get('SequenceFlow_7').waypoints;
        expect(waypoints).to.have.length(3);

        var intersec = waypoints[1];
        expect(intersec).to.eql(point(mid));

      }));


      it('down-right', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_5');
        var mid = {
          x : task.x + task.width / 2,
          y : task.y + task.height / 2
        };

        // when
        modeling.removeShape(task);

        // then
        var waypoints = elementRegistry.get('SequenceFlow_3').waypoints;
        expect(waypoints).to.have.length(3);

        var intersec = waypoints[1];
        expect(intersec).to.eql(point(mid));

      }));


      it('up-right', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_8');
        var mid = {
          x : task.x + task.width / 2,
          y : task.y + task.height / 2
        };

        // when
        modeling.removeShape(task);

        // then
        var waypoints = elementRegistry.get('SequenceFlow_5').waypoints;
        expect(waypoints).to.have.length(3);

        var intersec = waypoints[1];
        expect(intersec).to.eql(point(mid));

      }));


      it('diagonal', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_4');
        var mid = {
          x: task.x + task.width / 2,
          y: 211
        };

        // when
        modeling.removeShape(task);

        // then
        var waypoints = elementRegistry.get('SequenceFlow_Diagonal').waypoints;
        expect(waypoints).to.have.length(3);

        var intersec = waypoints[1];
        expect(intersec).to.eql(point(mid));

      }));

    });


    describe('connection layouting', function() {

      var processDiagramXML = require('./RemoveElementBehavior.diagonal.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


      it('should execute', inject(function(modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task1');
        var sequenceFlow1 = elementRegistry.get('SequenceFlow1');

        // when
        modeling.removeShape(task);

        // then
        var waypoints = sequenceFlow1.waypoints;

        // SequenceFlow2 should be deleted
        expect(elementRegistry.get('SequenceFlow2')).to.be.undefined;
        expect(elementRegistry.get(task.id)).to.be.undefined;

        // source and target have one connection each
        expect(elementRegistry.get('StartEvent1').outgoing.length).to.be.equal(1);
        expect(elementRegistry.get('EndEvent1').incoming.length).to.be.equal(1);

        // connection has Manhattan layout
        expect(waypoints).to.have.length(4);
        expect(waypoints[0].y).to.eql(waypoints[1].y);
        expect(waypoints[1].x).to.eql(waypoints[2].x);
        expect(waypoints[2].y).to.eql(waypoints[3].y);

      }));


      it('should redo', inject(function(commandStack, modeling, elementRegistry) {

        // given
        var task = elementRegistry.get('Task1'),
            connection = elementRegistry.get('SequenceFlow1'),
            newWaypoints;

        // when
        modeling.removeShape(task);

        newWaypoints = connection.waypoints.slice();

        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));

    });

  });


  describe('do not combine sequence flows ', function() {

    var processDiagramXML = require('./RemoveElementBehavior.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    it('remove all if there are more than one incoming or outgoing', inject(function(modeling, elementRegistry) {

      // given
      var task = elementRegistry.get('Task3');

      // when
      modeling.removeShape(task);

      // then
      expect(elementRegistry.get(task.id)).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow4')).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow5')).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow6')).to.be.undefined;

      expect(elementRegistry.get('StartEvent2').outgoing).to.be.empty;
      expect(elementRegistry.get('StartEvent2').incoming).to.be.empty;

    }));


    it('when connection is not allowed', inject(function(modeling, elementRegistry) {

      // given
      var task = elementRegistry.get('Task2');

      // when
      modeling.removeShape(task);

      // then
      expect(elementRegistry.get(task.id)).to.be.undefined;
      expect(elementRegistry.get('SequenceFlow3')).to.be.undefined;
      expect(elementRegistry.get('DataOutputAssociation1')).to.be.undefined;

      expect(elementRegistry.get('DataStoreReference1').incoming).to.be.empty;
      expect(elementRegistry.get('IntermediateThrowEvent1').outgoing.length).to.be.eql(1);

    }));

  });

});




// helper //////////////////////

function point(p) {
  return {
    x: p.x,
    y: p.y
  };
}
