var _ = require('lodash');

var BpmnModel = require('../../../../lib/Model'),
    BpmnTreeWalker = require('../../../../lib/BpmnTreeWalker');

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

  beforeEach(Matchers.add);

  var bpmnModel = BpmnModel.instance();


  it('should walk simple process', function(done) {

    readFile('simple.bpmn', 'bpmn:Definitions', function(err, definitions) {

      if (err) {
        done(err);
      } else {

        var drawn = [];

        var visitor = function(element, di, ctx) {
          var id = element.id;

          drawn.push({ id: id, parent: ctx });

          return id;
        };

        new BpmnTreeWalker(visitor).handleDefinitions(definitions);

        var expectedDrawn = [
          { id: 'SubProcess_1', parent: undefined },
          { id: 'StartEvent_1', parent: 'SubProcess_1' },
          { id: 'Task_1', parent: 'SubProcess_1' },
          { id: 'SequenceFlow_1', parent: 'SubProcess_1' } ];


        expect(drawn).toDeepEqual(expectedDrawn);

        done();
      }
    });
  });

  it('should walk collaboration', function(done) {

    readFile('collaboration.bpmn', 'bpmn:Definitions', function(err, definitions) {

      if (err) {
        done(err);
      } else {

        var drawn = [];

        var visitor = function(element, di, ctx) {
          var id = element.id;

          drawn.push({ id: id, parent: ctx });

          return id;
        };
        
        new BpmnTreeWalker(visitor).handleDefinitions(definitions);

        var expectedDrawn = [
          { id : '_Participant_2', parent : undefined },
          { id : 'Task_1', parent : '_Participant_2' },
          { id : 'Participant_1', parent : undefined },
          { id : 'StartEvent_1', parent : 'Participant_1' } ];


        expect(drawn).toDeepEqual(expectedDrawn);

        done();
      }
    });
  });
});