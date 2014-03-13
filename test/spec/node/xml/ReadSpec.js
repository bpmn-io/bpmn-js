var os = require('os');

var BpmnModel = require('../../../../lib/Model'),
    Helper = require('../Helper'),
    Matchers = require('../../Matchers');


describe('Model', function() {

  var bpmnModel = BpmnModel.instance();

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

  describe('fromXML', function() {

    it('should read documentation', function(done) {
      // given
      
      // when
      readFile('documentation.bpmn', 'bpmn:Definitions', function(err, result) {
        
        expect(result).toDeepEqual({
          $type: 'bpmn:Definitions',
          id: 'documentation',
          targetNamespace: 'http://activiti.org/bpmn',
          rootElements: [
            {
              $type: 'bpmn:Process',
              id: 'Process_1',
              documentation: [
                { $type : 'bpmn:Documentation', text : 'THIS IS A PROCESS' }
              ],
              flowElements: [
                {
                  $type : 'bpmn:SubProcess',
                  id: 'SubProcess_1',
                  name : 'Sub Process 1',
                  documentation : [
                    { $type : 'bpmn:Documentation', text : os.EOL + '        <h1>THIS IS HTML</h1>' + os.EOL + '      ' }
                  ]
                }
              ]
            }
          ]
        });
        
        done(err);
      });
    });

    it('import simple Process', function(done) {

      // given

      // when
      readFile('simple.bpmn', 'bpmn:Definitions', function(err, result) {
        
        // then
        expect(result.id).toBe('simple');
        
        done(err);
      });
    });

    it('import edge waypoints', function(done) {

      // given
      
      // when
      readFile('di/bpmnedge-waypoint.part.bpmn', 'bpmndi:BPMNEdge', function(err, result) {
        
        // then
        expect(result).toDeepEqual({
          $type: 'bpmndi:BPMNEdge',
          id : 'sid-2365FF07-4092-4B79-976A-AD192FE4E4E9_gui',
          waypoint: [
            { $type: 'dc:Point', x: 4905.0, y: 1545.0 },
            { $type: 'dc:Point', x: 4950.0, y: 1545.0 }
          ]
        });

        done(err);
      });
    });

    it('import simple Process (default ns)', function(done) {

      // given

      // when
      readFile('simple-default-ns.bpmn', 'bpmn:Definitions', function(err, result) {
        
        expect(result.id).toBe('simple');
        
        done(err);
      });
    });

    describe('should import references', function() {

      it('via attributes', function(done) {

        // given
        var xml = '<bpmn:sequenceFlow xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/bpmnModel" sourceRef="FOO_BAR" />';

        // when
        read(xml, 'bpmn:SequenceFlow', function(err, result, context) {

          var expectedReference = {
            element: {
              $type: 'bpmn:SequenceFlow'
            },
            property: 'bpmn:sourceRef',
            id: 'FOO_BAR'
          };

          var references = context.getReferences();

          // then
          expect(references).toDeepEqual([ expectedReference ]);

          done(err);
        });
      });

      it('via elements', function(done) {

        // given
        var xml =
          '<bpmn:serviceTask xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/bpmnModel">' +
            '<bpmn:outgoing>OUT_1</bpmn:outgoing>' +
            '<bpmn:outgoing>OUT_2</bpmn:outgoing>' +
          '</bpmn:serviceTask>';

        // when
        read(xml, 'bpmn:ServiceTask', function(err, result, context) {

          var reference1 = {
            element: {
              $type: 'bpmn:ServiceTask'
            },
            property: 'bpmn:outgoing',
            id: 'OUT_1'
          };

          var reference2 = {
            element: {
              $type: 'bpmn:ServiceTask'
            },
            property: 'bpmn:outgoing',
            id: 'OUT_2'
          };

          var references = context.getReferences();

          // then
          expect(references).toDeepEqual([ reference1, reference2 ]);

          done(err);
        });
      });
    });

    describe('should import element', function() {

      it('empty Definitions', function(done) {

        // given

        // when
        readFile('empty-definitions.bpmn', 'bpmn:Definitions', function(err, result) {
          
          var expected = {
            $type: 'bpmn:Definitions',
            id: 'empty-definitions',
            targetNamespace: 'http://activiti.org/bpmn'
          };

          // then
          expect(result).toDeepEqual(expected);

          done(err);
        });
      });

      it('empty Definitions (default ns)', function(done) {

        // given
        
        // when
        readFile('empty-definitions-default-ns.bpmn', 'bpmn:Definitions', function(err, result) {

          var expected = {
            $type: 'bpmn:Definitions',
            id: 'empty-definitions',
            targetNamespace: 'http://activiti.org/bpmn'
          };

          // then
          expect(result).toDeepEqual(expected);

          done(err);
        });
      });

      it('SubProcess / flow nodes', function(done) {

        // given

        // when
        readFile('sub-process-flow-nodes.part.bpmn', 'bpmn:SubProcess', function(err, result) {

          var expected = {
            $type: 'bpmn:SubProcess',
            id: 'SubProcess_1',
            name: 'Sub Process 1',

            flowElements: [
              { $type: 'bpmn:StartEvent', id: 'StartEvent_1', name: 'Start Event 1' },
              { $type: 'bpmn:Task', id: 'Task_1', name: 'Task' },
              { $type: 'bpmn:SequenceFlow', id: 'SequenceFlow_1', name: '' }
            ]
          };

          // then
          expect(result).toDeepEqual(expected);

          done(err);
        });
      });

      it('SubProcess / flow nodes / nested references', function(done) {

        // given
        
        // when
        readFile('sub-process.part.bpmn', 'bpmn:SubProcess', function(err, result) {

          var expected = {
            $type: 'bpmn:SubProcess',
            id: 'SubProcess_1',
            name: 'Sub Process 1',

            flowElements: [
              { $type: 'bpmn:StartEvent', id: 'StartEvent_1', name: 'Start Event 1' },
              { $type: 'bpmn:Task', id: 'Task_1', name: 'Task' },
              { $type: 'bpmn:SequenceFlow', id: 'SequenceFlow_1', name: '' }
            ]
          };

          // then
          expect(result).toDeepEqual(expected);

          done(err);
        });
      });

      it('SubProcess / incoming + flow nodes', function(done) {

        // given
        
        // when
        readFile('subprocess-flow-nodes-outgoing.part.bpmn', 'bpmn:Process', function(err, result) {

          var expectedSequenceFlow = {
            $type: 'bpmn:SequenceFlow',
            id: 'SequenceFlow_1'
          };

          var expectedSubProcess = {
            $type: 'bpmn:SubProcess',
            id: 'SubProcess_1',
            name: 'Sub Process 1',

            flowElements: [
              { $type: 'bpmn:Task', id: 'Task_1', name: 'Task' }
            ]
          };

          var expected = {
            $type: 'bpmn:Process',
            flowElements: [
              expectedSubProcess,
              expectedSequenceFlow
            ]
          };

          // then
          expect(result).toDeepEqual(expected);


          var subProcess = result.flowElements[0];
          var sequenceFlow = result.flowElements[1];
          
          // expect correctly resolved references
          expect(subProcess.incoming).toDeepEqual([ expectedSequenceFlow ]);
          expect(subProcess.outgoing).toDeepEqual([ expectedSequenceFlow ]);

          expect(sequenceFlow.sourceRef).toDeepEqual(expectedSubProcess);
          expect(sequenceFlow.targetRef).toDeepEqual(expectedSubProcess);

          done(err);
        });
      });

      it('BPMNShape / nested bounds / non-ns-attributes', function(done) {

        // given
        
        // when
        readFile('di/bpmnshape.part.bpmn', 'bpmndi:BPMNShape', function(err, result) {

          var expected = {
            $type: 'bpmndi:BPMNShape',
            id: 'BPMNShape_1',
            isExpanded: true,
            bounds: { $type: 'dc:Bounds', height: 300.0, width: 300.0, x: 300.0, y: 80.0 }
          };

          // then
          expect(result).toDeepEqual(expected);
          expect(result.bounds).toBeDefined();

          done(err);
        });
      });

      it('BPMNEdge / nested waypoints / explicit xsi:type', function(done) {

        // given

        // when
        readFile('di/bpmnedge.part.bpmn', 'bpmndi:BPMNEdge', function(err, result) {

          var expected = {
            $type: 'bpmndi:BPMNEdge',
            id: 'BPMNEdge_1',
            waypoint: [
              { $type: 'dc:Point', x: 388.0, y: 260.0 },
              { $type: 'dc:Point', x: 420.0, y: 260.0 }
            ]
          };

          // then
          expect(result).toDeepEqual(expected);

          done(err);
        });
      });

      it('BPMNDiagram / nested elements', function(done) {

        // given

        // when
        readFile('di/bpmndiagram.part.bpmn', 'bpmndi:BPMNDiagram', function(err, result) {

          var expected = {
            $type: 'bpmndi:BPMNDiagram',
            id: 'bpmndiagram',

            plane: {
              $type: 'bpmndi:BPMNPlane',
              id: 'BPMNPlane_1',
              planeElement: [
                {
                  $type: 'bpmndi:BPMNShape',
                  id: 'BPMNShape_1',
                  isExpanded: true,
                  bounds: { $type: 'dc:Bounds', height: 300.0, width: 300.0, x: 300.0, y: 80.0 }
                },
                {
                  $type: 'bpmndi:BPMNEdge',
                  id: 'BPMNEdge_1',
                  waypoint: [
                    { $type: 'dc:Point', x: 388.0, y: 260.0 },
                    { $type: 'dc:Point', x: 420.0, y: 260.0 }
                  ]
                }
              ]
            }
          };

          // then
          expect(result).toDeepEqual(expected);

          done(err);
        });
      });

    });
  });

});