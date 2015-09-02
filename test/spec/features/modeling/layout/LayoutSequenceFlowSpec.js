'use strict';

var Helper = require('./Helper');

var connect = Helper.connect,
    element = Helper.element,
    move = Helper.move,
    reconnectEnd = Helper.reconnectEnd;

var Modeler = require('../../../../../lib/Modeler');


/* global bootstrapModeler, inject */

var appendElement = require('../../../../util/ModelingUtil').appendElement,
    moveElements = require('../../../../util/ModelingUtil').moveElements,
    getElement = require('../../../../util/ModelingUtil').getElement;


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - layout', function() {


  describe.skip('overall experience, flow elements', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.flowElements.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: Modeler.prototype._modules }));


    it('should feel awesome', inject(function() { }));

  });


  describe.skip('overall experience, boundary events', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.boundaryEvents.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: Modeler.prototype._modules }));


    it('should feel awesome', inject(function() { }));

  });


  describe('flow elements', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.flowElements.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('gateway layout', function() {

      it('should layout v:h after Gateway', inject(function() {

        // when
        var connection = connect('ExclusiveGateway_1', 'BusinessRuleTask_1');

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":678,"y":302},"x":678,"y":277},
          {"x":678,"y":220},
          {"original":{"x":840,"y":220},"x":790,"y":220}
        ]);
      }));


      it('should layout h:v before Gateway', inject(function() {

        // when
        var connection = connect('BusinessRuleTask_1', 'ParallelGateway_1');

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":840,"y":220},"x":890,"y":220},
          {"x":1005,"y":220},
          {"original":{"x":1005,"y":302},"x":1005,"y":277}
        ]);
      }));

    });


    describe('other elements layout', function() {

      it('should layout h:h after StartEvent', inject(function() {

        // when
        var connection = connect('StartEvent_1', 'Task_1');

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":170,"y":302},"x":188,"y":302},
          {"x":235,"y":302},
          {"x":235,"y":220},
          {"original":{"x":332,"y":220},"x":282,"y":220}
        ]);
      }));


      it('should layout h:h after Task', inject(function() {

        // when
        var connection = connect('ServiceTask_1', 'BusinessRuleTask_1');

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":678,"y":117},"x":728,"y":117},
          {"x":759,"y":117},
          {"x":759,"y":220},
          {"original":{"x":840,"y":220},"x":790,"y":220}
        ]);
      }));


      it('should layout h:h after IntermediateEvent', inject(function() {

        // when
        var connection = connect('IntermediateThrowEvent_1', 'ServiceTask_1');

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":496,"y":302},"x":514,"y":302},
          {"x":571,"y":302},
          {"x":571,"y":117},
          {"original":{"x":678,"y":117},"x":628,"y":117}
        ]);
      }));


      it('should layout h:h after IntermediateEvent (right to left)', inject(function() {

        // when
        var connection = connect('IntermediateThrowEvent_1', 'Task_1');

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":496,"y":302},"x":478,"y":302},
          {"x":430,"y":302},
          {"x":430,"y":220},
          {"original":{"x":332,"y":220},"x":382,"y":220}
        ]);
      }));

    });


    describe('relayout', function() {

      it('should not repair after reconnect end', inject(function() {

        // given
        var newDocking = { x: 660, y: 280 };
        var connection = element('SequenceFlow_1');

        // when
        reconnectEnd(connection, 'ExclusiveGateway_1', newDocking);

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":382,"y":241},"x":382,"y":241},
          {"x":559,"y":241},
          {"x":559,"y":138},
          {"original":{"x":660,"y":280},"x":660,"y":280}
        ]);
      }));


      it('should repair after target move', inject(function() {

        // given
        var delta = { x: -30, y: 20 };
        var connection = element('SequenceFlow_1');

        // when
        move('ServiceTask_1', delta);

        // then
        expect(connection.waypoints).to.eql([{"original":{"x":382,"y":241},"x":382,"y":241},
          {"x":559,"y":241},
          {"x":559,"y":158},
          {"original":{"x":598,"y":158},"x":598,"y":158}
        ]);
      }));


      it('should repair after source move', inject(function() {

        // given
        var delta = { x: -30, y: 20 };
        var connection = element('SequenceFlow_1');

        // when
        move('Task_1', delta);

        // then
        expect(connection.waypoints).to.eql([
          {"original":{"x":352,"y":261},"x":352,"y":261},
          {"x":559,"y":261},
          {"x":559,"y":138},
          {"original":{"x":628,"y":138},"x":628,"y":138}
        ]);
      }));

    });

  });


  describe('boundary events', function() {

    var diagramXML = require('./LayoutSequenceFlowSpec.boundaryEvents.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should layout h:h connecting BoundaryEvent -> left Task', inject(function() {

      // when
      var connection = connect('BoundaryEvent_A', 'Task_1');

      // then
      expect(connection.waypoints).to.eql([
        {"original":{"x":505,"y":417},"x":487,"y":417},
        {"x":437,"y":417},
        {"x":437,"y":394},
        {"original":{"x":337,"y":394},"x":387,"y":394}
      ]);
    }));


    it('should layout h:v connecting BoundaryEvent -> bottom-left Task', inject(function() {

      // when
      var connection = connect('BoundaryEvent_A', 'Task_2');

      // then
      expect(connection.waypoints).to.eql([
        {"original":{"x":505,"y":417},"x":487,"y":417},
        {"x":412,"y":417},
        {"original":{"x":412,"y":543},"x":412,"y":503}
      ]);
    }));


    it('should layout h:v connecting BoundaryEvent -> top-right Task', inject(function() {

      // when
      var connection = connect('BoundaryEvent_A', 'Task_5');

      // then
      expect(connection.waypoints).to.eql([
        {"original":{"x":505,"y":417},"x":523,"y":417},
        {"x":1016,"y":417},
        {"original":{"x":1016,"y":215},"x":1016,"y":255}
      ]);
    }));


    it('should layout v:v connecting BoundaryEvent -> top Task', inject(function() {

      // when
      var connection = connect('BoundaryEvent_B', 'Task_4');

      // then
      expect(connection.waypoints).to.eql([
        {"original":{"x":586,"y":258},"x":586,"y":240},
        {"original":{"x":586,"y":121},"x":586,"y":161}
      ]);
    }));


    it('should layout v:h connecting BoundaryEvent -> top-left Task', inject(function() {

      // when
      var connection = connect('BoundaryEvent_B', 'Task_3');

      // then
      expect(connection.waypoints).to.eql([
        {"original":{"x":586,"y":258},"x":586,"y":258},
        {"x":586,"y":162},
        {"original":{"x":428,"y":162},"x":478,"y":162}
      ]);
    }));


    it('should layout h:v connecting BoundaryEvent -> bottom-right Task', inject(function() {

      // when
      var connection = connect('BoundaryEvent_C', 'Task_6');

      // then
      expect(connection.waypoints).to.eql([
        {"original":{"x":855,"y":293},"x":873,"y":293},
        {"x":1041,"y":293},
        {"original":{"x":1041,"y":483},"x":1041,"y":443}
      ]);
    }));


    it('should layout v:h connecting BoundaryEvent -> bottom-left Task', inject(function() {

      // when
      var connection = connect('BoundaryEvent_D', 'Task_2');

      // then
      expect(connection.waypoints).to.eql([
        {"original":{"x":815,"y":458},"x":815,"y":476},
        {"x":815,"y":543},
        {"original":{"x":412,"y":543},"x":462,"y":543}
      ]);
    }));

  });

});
