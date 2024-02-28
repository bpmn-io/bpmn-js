import { queryAll as domQueryAll } from 'min-dom';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import appendPreviewModule from 'lib/features/append-preview';
import coreModule from 'lib/core';

describe('features/append-preview', function() {

  var diagramXML = require('./AppendPreview.bpmn');

  before(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      appendPreviewModule
    ]
  }));


  it('should create', inject(function(appendPreview, canvas, elementRegistry) {

    // given
    var startEvent = elementRegistry.get('StartEvent_1');

    // when
    appendPreview.create(startEvent, 'bpmn:Task');

    // then
    expect(canvas.getLayer('complex-preview')).to.exist;
    expect(domQueryAll('.djs-dragger', canvas.getLayer('complex-preview'))).to.have.length(2);
  }));


  it('should clean up', inject(function(appendPreview, canvas, elementRegistry) {

    // given
    var startEvent = elementRegistry.get('StartEvent_1');

    // when
    appendPreview.create(startEvent, 'bpmn:Task');

    // assume
    expect(canvas.getLayer('complex-preview')).to.exist;
    expect(domQueryAll('.djs-dragger', canvas.getLayer('complex-preview'))).to.have.length(2);

    // when
    appendPreview.cleanUp();

    // then
    expect(domQueryAll('.djs-dragger', canvas.getLayer('complex-preview'))).to.be.empty;
  }));

});