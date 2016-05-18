'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - update label', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/modeling/update-label.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should change name of start event', inject(function(modeling, elementRegistry, eventBus) {

    // given
    var startEvent_1 = elementRegistry.get('StartEvent_1');

    // when
    modeling.updateLabel(startEvent_1, 'bar');

    // then
    expect(startEvent_1.businessObject.name).to.equal('bar');
    expect(startEvent_1.label.hidden).to.be.false;
  }));


  it('should change name of start event with hidden label', inject(function(modeling, elementRegistry) {

    // given
    var startEvent_2 = elementRegistry.get('StartEvent_2');

    // when
    modeling.updateLabel(startEvent_2, 'bar');

    // then
    expect(startEvent_2.businessObject.name).to.equal('bar');
    expect(startEvent_2.label.hidden).to.be.false;
  }));


  it('should hide label when setting empty string', inject(function(modeling, elementRegistry) {

    // given
    var startEvent_1 = elementRegistry.get('StartEvent_1');

    // when
    modeling.updateLabel(startEvent_1, '');

    // then
    expect(startEvent_1.businessObject.name).to.equal('');
    expect(startEvent_1.label.hidden).to.be.true;
  }));


  it('should change name of start event when editing label', inject(function(modeling, elementRegistry) {

    // given
    var startEvent_1 = elementRegistry.get('StartEvent_1');
    var startEvent_1_label = elementRegistry.get('StartEvent_1_label');

    // when
    modeling.updateLabel(startEvent_1_label, 'bar');

    // then
    expect(startEvent_1.businessObject.name).to.equal('bar');
    expect(startEvent_1.label.hidden).to.be.false;
  }));


  it('should change name of task', inject(function(modeling, elementRegistry) {

    // given
    var task_1 = elementRegistry.get('Task_1');

    // when
    modeling.updateLabel(task_1, 'foo');

    // then
    expect(task_1.businessObject.name).to.equal('foo');
    expect(task_1.label).to.be.undefined;
  }));


  it('should propertly fire events.changed after event name change',
    inject(function(modeling, elementRegistry, eventBus) {

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
  }));


  it('should propertly fire events.changed after event label change',
    inject(function(modeling, elementRegistry, eventBus) {

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
  }));

});
