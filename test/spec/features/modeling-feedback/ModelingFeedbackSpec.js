import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from 'test/util/MockEvents';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import modelingFeedbackModule from 'lib/features/modeling-feedback';


describe('features/modeling - ModelingFeedback', function() {

  var collaborationDiagramXML = require('./ModelingFeedback.bpmn');

  beforeEach(bootstrapModeler(collaborationDiagramXML, {
    modules: [
      coreModule,
      modelingModule,
      modelingFeedbackModule
    ]
  }));

  it('should indicate error when placing flow elements inside collaboration', inject(
    function(create, canvas, elementFactory, dragging) {

      // given
      var task = elementFactory.createShape({ type: 'bpmn:Task' });

      var collaboration = canvas.getRootElement();
      var collaborationGfx = canvas.getGraphics(collaboration);

      create.start(canvasEvent({ x: 100, y: 100 }), task);
      dragging.hover({ element: collaboration, gfx: collaborationGfx });

      // when
      dragging.end();

      // then
      expectTooltip('error', 'flow elements must be children of pools/participants');
    }));


  it('should indicate error when placing data objects inside collaboration', inject(
    function(create, canvas, elementFactory, dragging) {

      // given
      var dataObject = elementFactory.createShape({ type: 'bpmn:DataObjectReference' });

      var collaboration = canvas.getRootElement();
      var collaborationGfx = canvas.getGraphics(collaboration);

      create.start(canvasEvent({ x: 150, y: 150 }), dataObject);
      dragging.hover({ element: collaboration, gfx: collaborationGfx });

      // when
      dragging.end();

      // then
      expectTooltip('error', 'Data object must be placed within a pool/participant.');
    }
  ));

});

function expectTooltip(cls, message) {

  return getBpmnJS().invoke(function(canvas) {

    var tooltipEl = document.querySelector('[data-tooltip-id]', canvas.getContainer());

    expect(tooltipEl.textContent).to.eql(message);
    expect(tooltipEl.classList.contains(cls));
  });
}