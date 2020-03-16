import {
  bootstrapModeler,
  getBpmnJS
} from 'test/TestHelper';

import {
  add,
  attach,
  connect
} from './Helper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import emptyProcessXML from 'test/fixtures/bpmn/collaboration/process-empty.bpmn';


describe('features/modeling - di ordering', function() {
  var testModules = [coreModule, modelingModule];

  describe('boundary events', function() {

    beforeEach(bootstrapModeler(emptyProcessXML, { modules: testModules }));


    it('should place after tasks', function(done) {

      // when
      var task1 = add({ type: 'bpmn:Task' }, { x: 100, y: 100 }),
          event = attach(
            { type: 'bpmn:BoundaryEvent' },
            { x: 100, y: 140 },
            task1
          ),
          task2 = add({ type: 'bpmn:Task' }, { x: 300, y: 100 });

      // then
      expectDiOrder([ 'Process_1', task1.id, task2.id, event.id ], done);
    });
  });


  describe('collaboration', function() {

    beforeEach(bootstrapModeler(emptyProcessXML, { modules: testModules }));


    it('should place di elements in correct order', function(done) {

      // given
      var canvas = getBpmnJS().get('canvas'),
          root;

      // when
      var participant1 = add(
        { type: 'bpmn:Participant', height: 300 }, { x: 300, y: 200 }, 'Process_1'
      );

      root = canvas.getRootElement();
      var participant2 = add({ type: 'bpmn:Participant' }, { x: 300, y: 500 }),
          task1 = add({ type: 'bpmn:Task' }, { x: 400, y: 150 }, participant1.id),
          task2 = add({ type: 'bpmn:Task' }, { x: 250, y: 150 }, participant1.id);

      var messageFlow1 = connect(task1, participant2),
          messageFlow2 = connect(participant2, participant1),
          sequenceFlow = connect(task2, task1);

      // then
      expectDiOrder([
        root.id,
        participant1.id,
        sequenceFlow.id,
        task1.id,
        task2.id,
        participant2.id,
        messageFlow1.id,
        messageFlow2.id
      ], done);
    });
  });


  describe('subprocess', function() {

    beforeEach(bootstrapModeler(emptyProcessXML, { modules: testModules }));


    it('should place di elements in correct order', function(done) {

      // given
      var canvas = getBpmnJS().get('canvas'),
          root;

      // when
      var subProcess = add(
        { type: 'bpmn:SubProcess', isExpanded: true, width: 300, height: 200 }, { x: 300, y: 200 }
      );

      var participant = add({ type: 'bpmn:Participant', width: 500, height: 300 }, { x: 300, y: 200 }),
          task1 = add({ type: 'bpmn:Task' }, { x: 250, y: 200 }, subProcess.id);

      root = canvas.getRootElement();

      // then
      expectDiOrder([
        root.id,
        participant.id,
        subProcess.id,
        task1.id,
      ], done);
    });
  });


  describe('wrong ordering in xml', function() {
    var diagramXML = require('./wrong-di-order.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should correctly order di elements on export', function(done) {

      // then
      expectDiOrder(
        [
          'Page1Process',
          'SequenceFlow_13g7fzw',
          'SequenceFlow_1c22uay',
          'SequenceFlow_1fp5smb',
          'SequenceFlow_1kwx6kg',
          'SequenceFlow_1sv6jqd',
          'SequenceFlow_1ysz115',
          'SequenceFlow_0qen1he',
          'SequenceFlow_0nqtgik',
          'SequenceFlow_0zafwi9',
          'MakeBookingSubProcess',
          'SequenceFlow_3',
          'SequenceFlow_2',
          'SequenceFlow_1',
          'SequenceFlow',
          'SequenceFlow_1244t37',
          'SequenceFlow_0e0tkzl',
          'StartEvent_1',
          'ExclusiveGateway_1l6x19l',
          'BookFlightTask',
          'CancelFlightTask',
          'BookHotelTask',
          'ParalelGateway',
          'TravelBookedEndEvent',
          'CancelHotelTask',
          'HandleCompensationSubProcess',
          'SequenceFlow_0e6xitm',
          'SequenceFlow_0zpw5ma',
          'SequenceFlow_03663sw',
          'SequenceFlow_0i33vwg',
          'SequenceFlow_09qgqyw',
          'SequenceFlow_0cip1mz',
          'BookingStartEvent',
          'ParallelGateway_0vh9j6n',
          'FlightEvent',
          'HotelEvent',
          'ParallelGateway_1ycdyix',
          'EndEvent_0nr3cro',
          'FlightBoundaryEvent',
          'HotelBoundaryEvent',
          'Association_0qea76h',
          'Association_1',
          'CancelRequestEndEvent',
          'RequestCancelledEndEvent',
          'GatewayGateway',
          'OfferApprovedEvent',
          'N24HoursEvent',
          'N24HoursEvent1',
          'CancelRequestEvent',
          'MakeFlyAndHotelOfferTask',
          'RequestCreditCardInformationTask',
          'NotifyCustomerOfferExpiredTask',
          'UpdateCustomerRecordTask',
          'ReceiveTravelRequestStartEvent'
        ],
        done
      );
    });
  });
});

// helper
function expectDiOrder(expectedOrder, done) {
  getBpmnJS().saveXML({ format: true }, function(error, xml) {
    if (error) {
      return done(error);
    }

    var pattern = /bpmnElement="([^"]+)"/g,
        exportedOrder = [],
        match = pattern.exec(xml);

    while (match !== null) {
      exportedOrder.push(match[1]);

      match = pattern.exec(xml);
    }

    try {
      expect(exportedOrder).to.eql(expectedOrder);

      done();
    } catch (err) {
      return done(err);
    }
  });
}
