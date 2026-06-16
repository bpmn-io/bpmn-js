import { expect } from 'chai';

import {
  bootstrapModeler,
  inject
} from 'test/helper';

import drawModule from 'lib/draw';

describe('draw - DarkModeRenderer', function() {

  var xml = require('../../fixtures/bpmn/simple.bpmn');

  beforeEach(bootstrapModeler(xml, {
    additionalModules: [
      drawModule
    ]
  }));


  it('should apply dark theme properties to structural elements', inject(function(canvas, elementRegistry, injector) {

    // given
    document.documentElement.setAttribute('data-theme', 'dark');

    var darkModeRenderer = injector.get('darkModeRenderer');
    var taskElement = elementRegistry.get('Task_1');
    var taskGfx = canvas.getGraphics(taskElement);

    // when
    darkModeRenderer.refreshAll();

    // then
    var rect = taskGfx.querySelector('rect');
    expect(rect.style.getPropertyValue('fill')).to.eql('rgb(34, 37, 42)');
    expect(rect.style.getPropertyValue('stroke')).to.eql('rgb(255, 255, 255)');
  }));


  it('should keep paths and connection lines transparent', inject(function(canvas, elementRegistry, injector) {

    // given
    document.documentElement.setAttribute('data-theme', 'dark');

    var darkModeRenderer = injector.get('darkModeRenderer');
    var flowElement = elementRegistry.get('SequenceFlow_1');
    var flowGfx = canvas.getGraphics(flowElement);

    // when
    darkModeRenderer.refreshAll();

    // then
    var path = flowGfx.querySelector('path');
    expect(path.style.getPropertyValue('fill')).to.eql('none');
    expect(path.style.getPropertyValue('stroke')).to.eql('rgb(255, 255, 255)');
  }));

});