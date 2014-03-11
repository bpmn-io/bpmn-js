var _ = require('lodash');

var BpmnModel = require('../../../lib/model/BpmnModel');

var Helper = require('../Helper');

describe('BpmnModel', function() {

  beforeEach(Helper.initAdditionalMatchers);

  describe('parsing', function() {

    it('should publish type', function() {
      // given
      var model = BpmnModel.instance();

      // when
      var type = model.getType('bpmn:Process');

      // then
      expect(type).toBeDefined();
      expect(type.$descriptor).toBeDefined();
    });

    it('should redefine property', function() {
      // given
      var model = BpmnModel.instance();

      // when
      var type = model.getType('bpmndi:BPMNShape');

      // then
      expect(type).toBeDefined();

      var descriptor = type.$descriptor;

      expect(descriptor).toBeDefined();
      expect(descriptor.propertiesByName['di:modelElement']).toEqual(descriptor.propertiesByName['bpmndi:bpmnElement']);
    });
  });

  describe('creation', function() {

    it('should create SequenceFlow', function() {

      var model = BpmnModel.instance();

      var sequenceFlow = model.create('bpmn:SequenceFlow');

      expect(sequenceFlow.$type).toEqual('bpmn:SequenceFlow');
    });

    it('should create Definitions', function() {

      var model = BpmnModel.instance();

      var definitions = model.create('bpmn:Definitions');

      expect(definitions.$type).toEqual('bpmn:Definitions');
    });
  });

  describe('property access', function() {

    describe('singleton properties', function() {

      it('should set attribute', function() {

        // given
        var model = BpmnModel.instance();
        var process = model.create('bpmn:Process');

        // assume
        expect(process.get('isExecutable')).not.toBeDefined();

        // when
        process.set('isExecutable', true);

        // then
        expect(process).toDeepEqual({
          $type: 'bpmn:Process',
          isExecutable: true
        });
      });

      it('should set attribute (ns)', function() {

        // given
        var model = BpmnModel.instance();
        var process = model.create('bpmn:Process');

        // when
        process.set('bpmn:isExecutable', true);

        // then
        expect(process).toDeepEqual({
          $type: 'bpmn:Process',
          isExecutable: true
        });
      });

      it('should set id attribute', function() {

        // given
        var model = BpmnModel.instance();

        var definitions = model.create('bpmn:Definitions');

        // when
        definitions.set('id', 10);

        // then
        expect(definitions).toDeepEqual({
          $type: 'bpmn:Definitions',
          id: 10
        });
      });
    });

    describe('builder', function() {

      it('should create simple hierarchy', function() {

        // given
        var model = BpmnModel.instance();

        var definitions = model.create('bpmn:Definitions');
        var rootElements = definitions.get('bpmn:rootElements');

        var process = model.create('bpmn:Process');
        var collaboration = model.create('bpmn:Collaboration');

        // when
        rootElements.push(collaboration);
        rootElements.push(process);

        // then
        expect(rootElements).toEqual([ collaboration, process ]);
        expect(definitions.rootElements).toEqual([ collaboration, process ]);

        expect(definitions).toDeepEqual({
          $type: 'bpmn:Definitions',
          rootElements: [
            { $type: 'bpmn:Collaboration' },
            { $type: 'bpmn:Process' }
          ]
        });
      });
    });
  });
});