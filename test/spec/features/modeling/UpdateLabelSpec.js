import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - update label', function() {

  var diagramXML = require('./UpdateLabel.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  it('should change name of start event', inject(
    function(modeling, elementRegistry) {

      // given
      var startEvent_1 = elementRegistry.get('StartEvent_1');
      var businessObject = startEvent_1.businessObject;

      // when
      modeling.updateLabel(startEvent_1, 'bar');

      // then
      expect(businessObject.name).to.equal('bar');
    }
  ));


  it('should create label name of start event', inject(
    function(modeling, elementRegistry) {

      // given
      var startEvent_2 = elementRegistry.get('StartEvent_2');
      var businessObject = startEvent_2.businessObject;

      // when
      modeling.updateLabel(startEvent_2, 'bar');

      // then
      var label = startEvent_2.label;
      var di = startEvent_2.di;

      expect(businessObject.name).to.equal('bar');

      expect(label).to.exist;
      expect(label.businessObject).to.equal(businessObject);
      expect(label.di).to.equal(di);
    }
  ));


  it('should not create label on empty text', inject(
    function(modeling, elementRegistry) {

      // given
      var startEvent_2 = elementRegistry.get('StartEvent_2');

      // when
      modeling.updateLabel(startEvent_2, '');

      // then
      expect(startEvent_2.businessObject.name).to.equal('');
      expect(startEvent_2.label).not.to.exist;

      expect(startEvent_2).to.have.dimensions({
        width: 36,
        height: 36
      });
    }
  ));


  it('should not create label on (sub)process plane', inject(
    function(modeling, elementRegistry) {

      // given
      var SubProcess_1 = elementRegistry.get('Subprocess_1_plane');

      // when
      modeling.updateLabel(SubProcess_1, 'Cool new label');

      // then
      expect(SubProcess_1.businessObject.name).to.equal('Cool new label');
      expect(SubProcess_1.di.get('label')).not.to.exist;
    }
  ));


  describe('should delete label', function() {

    it('when setting null', inject(
      function(modeling, elementRegistry) {

        // given
        var startEvent_1 = elementRegistry.get('StartEvent_1');

        // when
        modeling.updateLabel(startEvent_1, null);

        // then
        expect(startEvent_1.businessObject.name).not.to.exist;
        expect(startEvent_1.label).not.to.exist;
      }
    ));


    it('when setting empty string', inject(
      function(modeling, elementRegistry) {

        // given
        var startEvent_1 = elementRegistry.get('StartEvent_1');

        // when
        modeling.updateLabel(startEvent_1, '');

        // then
        expect(startEvent_1.businessObject.name).to.equal('');
        expect(startEvent_1.label).not.to.exist;
      }
    ));

  });


  it('should change name of start event when editing label', inject(
    function(modeling, elementRegistry) {

      // given
      var startEvent_1 = elementRegistry.get('StartEvent_1');
      var startEvent_1_label = elementRegistry.get('StartEvent_1_label');

      // when
      modeling.updateLabel(startEvent_1_label, 'bar');

      // then
      expect(startEvent_1.businessObject.name).to.equal('bar');
    }
  ));


  it('should change text annotation text and bounds', inject(
    function(modeling, elementRegistry) {

      // given
      var element = elementRegistry.get('TextAnnotation_1');

      var newBounds = { x: 100, y: 100, width: 100, height: 30 };

      // when
      modeling.updateLabel(element, 'bar', newBounds);

      // then
      expect(element.businessObject.text).to.equal('bar');
      expect(element).to.have.bounds(newBounds);
    }
  ));


  it('should change value of group', inject(function(modeling, elementRegistry) {

    // given
    var group_1 = elementRegistry.get('Group_1');

    // when
    modeling.updateLabel(group_1, 'foo');

    // then
    expect(group_1.businessObject.categoryValueRef.value).to.equal('foo');
    expect(group_1.label).to.exist;
  }));


  it('should properly fire events.changed after event name change', inject(
    function(modeling, elementRegistry, eventBus) {

      // given
      var startEvent_1 = elementRegistry.get('StartEvent_1');

      var changedEvent;

      eventBus.on('elements.changed', function(event) {
        changedEvent = event;
      });

      // when
      modeling.updateLabel(startEvent_1, 'foo');

      // then
      expect(changedEvent.elements).to.include(startEvent_1);
    }
  ));


  it('should propertly fire events.changed after event label change', inject(
    function(modeling, elementRegistry, eventBus) {

      // given
      var startEvent_1 = elementRegistry.get('StartEvent_1');
      var startEvent_1_label = elementRegistry.get('StartEvent_1_label');

      var changedEvent;

      eventBus.on('elements.changed', function(event) {
        changedEvent = event;
      });

      // when
      modeling.updateLabel(startEvent_1_label, 'foo');

      // then
      expect(changedEvent.elements).to.include(startEvent_1);
    }
  ));


  it('should resize empty text annotation', inject(function(modeling, elementRegistry) {

    // given
    var element = elementRegistry.get('TextAnnotation_1');

    var newBounds = { x: 100, y: 100, width: 100, height: 30 };

    // when
    modeling.updateLabel(element, null, newBounds);

    // then
    expect(element).to.have.bounds(newBounds);
  }));


  describe('embedded labels', function() {

    it('should change name of task', inject(function(modeling, elementRegistry) {

      // given
      var task_1 = elementRegistry.get('Task_1');

      // when
      modeling.updateLabel(task_1, 'foo');

      // then
      expect(task_1.businessObject.name).to.equal('foo');
      expect(task_1.di.label).to.exist;
    }));


    it('should delete label of task', inject(function(modeling, elementRegistry) {

      // given
      var task_2 = elementRegistry.get('Task_2');

      // when
      modeling.updateLabel(task_2, '');

      // then
      expect(task_2.businessObject.name).to.equal('');
      expect(task_2.di).not.to.have.property('label');
    }));

  });

});