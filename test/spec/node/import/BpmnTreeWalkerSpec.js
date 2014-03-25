var _ = require('lodash');

var BpmnModel = require('../../../../lib/Model'),
    BpmnTreeWalker = require('../../../../lib/import/BpmnTreeWalker');

var Helper = require('../Helper'),
    Matchers = require('../../Matchers');


describe('BpmnTreeWalker', function() {

  function readBpmnDiagram(file) {
    return Helper.readFile('test/fixtures/bpmn/' + file);
  }

  function read(xml, root, opts, callback) {
    return BpmnModel.fromXML(xml, root, opts, callback);
  }

  function readFile(file, root, opts, callback) {
    return read(readBpmnDiagram(file), root, opts, callback);
  }


  /**
   * A simple handler that records what a tree walker processes
   */
  function RecordingHandler() {

    var elements = [];
    var errors = [];

    function handleElement(element, di, ctx) {
      var id = element.id;

      elements.push({ id: id, parent: ctx });

      return id;
    }

    function handleError(message, context) {
      errors.push({ message: message, context: context });
    }

    this.element = handleElement;
    this.error = handleError;

    this._errors = errors;
    this._elements = elements;
  }

  function readBpmn(file, fn, done) {
    readFile(file, 'bpmn:Definitions', function(err, definitions) {

      if (err) {
        return done(err);
      }

      fn(definitions);

      done();
    });
  }


  /**
   * Expect a certain render order when parsing the given file contents.
   * 
   * Call done when done.
   */
  function expectWalkOrder(file, expectedOrder, done) {

    readBpmn(file, function(definitions) {

      var handler = new RecordingHandler();

      new BpmnTreeWalker(handler).handleDefinitions(definitions);

      expect(handler._elements).toDeepEqual(expectedOrder);
      expect(handler._errors.length).toBe(0);

    }, done);
  }


  beforeEach(Matchers.add);

  var bpmnModel = BpmnModel.instance();


  describe('should walk', function() {

    it('process / sub process', function(done) {

      // given
      var expectedOrder = [
        { id: 'SubProcess_1', parent: undefined },
        { id: 'StartEvent_1', parent: 'SubProcess_1' },
        { id: 'Task_1', parent: 'SubProcess_1' },
        { id: 'SequenceFlow_1', parent: 'SubProcess_1' } ];

      // then
      expectWalkOrder('simple.bpmn', expectedOrder, done);
    });

    it('process elements', function(done) {

      // given
      var expectedOrder = [
        { id : 'ParallelGateway_1', parent : undefined },
        { id : 'ServiceTask_1', parent : undefined },
        { id : 'DataStoreReference_2', parent : undefined },
        { id : 'CallActivity_1', parent : undefined },
        { id : 'StartEvent_2', parent : undefined },
        { id : 'ExclusiveGateway_1', parent : undefined },
        { id : 'SubProcess_1', parent : undefined },
        { id : 'StartEvent_1', parent : 'SubProcess_1' },
        { id : 'Task_1', parent : 'SubProcess_1' },
        { id : 'BoundaryEvent_1', parent : 'SubProcess_1' },
        { id : 'SequenceFlow_1', parent : 'SubProcess_1' },
        { id : 'SequenceFlow_7', parent : 'SubProcess_1' },
        { id : 'SequenceFlow_6', parent : undefined },
        { id : 'SequenceFlow_2', parent : undefined },
        { id : 'SequenceFlow_4', parent : undefined },
        { id : 'SequenceFlow_5', parent : undefined },
        { id : 'SequenceFlow_3', parent : undefined }
      ];

      expectWalkOrder('process-elements.bpmn', expectedOrder, done);
    });

    it('associations / data objects', function(done) {

      // given
      var expectedOrder = [
        { id : 'Task_1', parent : undefined },
        { id : 'DataInputAssociation_1', parent : null },
        { id : 'DataOutputAssociation_1', parent : null },
        { id : 'BoundaryEvent_1', parent : undefined },
        { id : 'Task_2', parent : undefined },
        { id : 'DataInputAssociation_2', parent : null },
        { id : 'DataOutputAssociation_2', parent : null },
        { id : 'DataStoreReference_4', parent : undefined },
        { id : 'DataObjectReference_1', parent : undefined },
        { id : 'DataInput_1', parent : undefined },
        { id : 'DataOutput_1', parent : undefined },
        { id : 'Association_1', parent : undefined },
        { id : 'Association_2', parent : undefined }
      ];

      expectWalkOrder('process-associations.bpmn', expectedOrder, done);
    });

    it('collaboration', function(done) {

      // given
      var expectedOrder = [
        { id : 'Participant_2', parent : undefined },
        { id : 'Lane_1', parent : 'Participant_2' },
        { id : 'Lane_2', parent : 'Lane_1' },
        { id : 'Lane_3', parent : 'Lane_1' },
        { id : 'Task_1', parent : 'Lane_3' },
        { id : 'Participant_1', parent : undefined },
        { id : 'StartEvent_1', parent : 'Participant_1' }
      ];

      expectWalkOrder('collaboration.bpmn', expectedOrder, done);
    });
    
    it('collaboration / message flows', function(done) {

      // given
      var expectedOrder = [
        { id : 'Participant_2', parent : undefined },
        { id : 'Task_1', parent : 'Participant_2' },
        { id : 'EndEvent_1', parent : 'Participant_2' },
        { id : 'Participant_1', parent : undefined },
        { id : 'StartEvent_1', parent : 'Participant_1' },
        { id : 'MessageFlow_1', parent : undefined },
        { id : 'MessageFlow_2', parent : undefined },
        { id : 'MessageFlow_4', parent : undefined },
        { id : 'MessageFlow_5', parent : undefined }
      ];

      expectWalkOrder('collaboration-message-flows.bpmn', expectedOrder, done);
    });

    it('collaboration / sequence flows', function(done) {

      // given
      var expectedOrder = [
        { id : 'Participant_2', parent : undefined },
        { id : 'Lane_1', parent : 'Participant_2' },
        { id : 'Lane_2', parent : 'Lane_1' },
        { id : 'EndEvent_1', parent : 'Lane_2' },
        { id : 'Lane_3', parent : 'Lane_1' },
        { id : 'Task_1', parent : 'Lane_3' },
        { id : 'Lane_4', parent : 'Participant_2' },
        { id : 'ExclusiveGateway_1', parent : 'Lane_4' },
        { id : 'SequenceFlow_1', parent : undefined },
        { id : 'SequenceFlow_2', parent : undefined }
      ];

      expectWalkOrder('collaboration-sequence-flows.bpmn', expectedOrder, done);
    });

    it('collaboration / data items', function(done) {

      // given
      var expectedOrder = [
        { id : 'Participant_2', parent : undefined },
        { id : 'Lane_1', parent : 'Participant_2' },
        { id : 'Lane_2', parent : 'Lane_1' },
        { id : 'SubProcess_1', parent : 'Lane_2' },
        { id : 'DataObjectReference_1', parent : 'SubProcess_1' },
        { id : 'Lane_3', parent : 'Lane_1' },
        { id : 'DataStoreReference_5', parent : undefined },
        { id : 'DataStoreReference_6', parent : undefined },
        { id : 'Participant_1', parent : undefined },
        { id : 'DataInput_1', parent : 'Participant_1' },
        { id : 'DataOutput_1', parent : 'Participant_1' }
      ];

      expectWalkOrder('collaboration-data-items.bpmn', expectedOrder, done);
    });

  });


  describe('should handle errors', function() {

    it('missing bpmnElement on di', function(done) {

      // given
      readBpmn('error/di-no-bpmn-element.bpmn', function(definitions) {

        // when
        var handler = new RecordingHandler();
        new BpmnTreeWalker(handler).handleDefinitions(definitions);

        expect(handler._elements).toDeepEqual([]);
        expect(handler._errors.length).toBe(1);

        var error = handler._errors[0];

        expect(error.message).toBe('no bpmnElement for <bpmndi:BPMNShape#_BPMNShape_StartEvent_2>');
      }, done);

    });

  });


});