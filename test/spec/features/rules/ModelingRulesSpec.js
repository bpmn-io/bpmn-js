'use strict';

var Matchers = require('../../../Matchers'),
TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    rulesModule = require('../../../../lib/features/modeling/rules'),
    coreModule = require('../../../../lib/core');


describe('features/ModelingRules', function() {

  beforeEach(Matchers.addDeepEquals);


  var sequenceXML = fs.readFileSync('test/fixtures/bpmn/sequence-flows.bpmn', 'utf8');
  var eventGatewaysEdgeXML =
      fs.readFileSync('test/fixtures/bpmn/features/rules/event-based-gateway-outgoing-edge.bpmn', 'utf8');

  var testModules = [ coreModule, modelingModule, rulesModule ];


  // See workaround https://github.com/bpmn-io/bpmn-js/issues/176
  // The wanted behavior until https://github.com/bpmn-io/bpmn-js/issues/176 is fixed
  describe('connect with source == target', function() {

    beforeEach(bootstrapModeler(sequenceXML, { modules: testModules }));

    it('should not allow connection', inject(function(elementRegistry, modeling, rules) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: taskShape,
        target: taskShape
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(false);
    }));
  });

  describe('eventbased gateway', function() {

    beforeEach(bootstrapModeler(eventGatewaysEdgeXML, { modules: testModules }));

    it('should allow catching message intermediate event on outgoing edges', inject(function(elementRegistry, modeling, rules) {

      // given
      var eventGateway = elementRegistry.get('EventBasedGateway_1'),
          messageEvent = elementRegistry.get('IntermediateCatchEvent_0');


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: eventGateway,
        target: messageEvent
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(true);
    }));

    it('should allow catching timer intermediate event on outgoing edges', inject(function(elementRegistry, modeling, rules) {

      // given
      var eventGateway = elementRegistry.get('EventBasedGateway_1'),
          timerEvent = elementRegistry.get('IntermediateCatchEvent_1');


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: eventGateway,
        target: timerEvent
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(true);
    }));

    it('should allow catching condition intermediate event on outgoing edges', inject(function(elementRegistry, modeling, rules) {

      // given
      var eventGateway = elementRegistry.get('EventBasedGateway_1'),
          conditionEvent = elementRegistry.get('IntermediateCatchEvent_2');


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: eventGateway,
        target: conditionEvent
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(true);
    }));

    it('should allow catching signal intermediate event on outgoing edges', inject(function(elementRegistry, modeling, rules) {

      // given
      var eventGateway = elementRegistry.get('EventBasedGateway_1'),
          signalEvent = elementRegistry.get('IntermediateCatchEvent_3');


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: eventGateway,
        target: signalEvent
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(true);
    }));

    it('should allow receive task on outgoing edges', inject(function(elementRegistry, modeling, rules) {

      // given
      var eventGateway = elementRegistry.get('EventBasedGateway_1'),
          receiveTask = elementRegistry.get('ReceiveTask_1');


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: eventGateway,
        target: receiveTask
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(true);
    }));

    it('should not allow throw event on outgoing edges', inject(function(elementRegistry, modeling, rules) {

      // given
      var eventGateway = elementRegistry.get('EventBasedGateway_1'),
          throwEvent = elementRegistry.get('IntermediateThrowEvent_0');


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: eventGateway,
        target: throwEvent
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(false);
    }));

    it('should not allow task on outgoing edges', inject(function(elementRegistry, modeling, rules) {

      // given
      var eventGateway = elementRegistry.get('EventBasedGateway_1'),
          task = elementRegistry.get('Task_1');


      // when
      var allowed = rules.allowed('connection.create', {
        connection: null,
        source: eventGateway,
        target: task
      });

      // then
      // connection should not be allowed
      expect(allowed).toBe(false);
    }));

  });
});
