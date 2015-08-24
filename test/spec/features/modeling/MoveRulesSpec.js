'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('diagram-js/lib/features/move'),
    snappingModule = require('../../../../lib/features/snapping');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;


describe('features/modeling - move', function() {

  var testModules = [ coreModule, modelingModule, moveModule, snappingModule ];

  var testXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

  beforeEach(bootstrapModeler(testXML, { modules: testModules }));

  beforeEach(inject(function(dragging, canvas) {
    dragging.setOptions({ manual: true });
  }));

  afterEach(inject(function(dragging) {
    dragging.setOptions({ manual: false });
  }));


  it('should not attach label when moving BoundaryEvent', inject(function(elementRegistry, move, dragging) {
    // given
    var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
        subProcess = elementRegistry.get('SubProcess_1'),
        label = boundaryEvent.label;

    // when
    move.start(canvasEvent({ x: 190, y: 355 }), boundaryEvent);

    dragging.hover({
      element: subProcess,
      gfx: elementRegistry.getGraphics(subProcess)
    });

    dragging.move(canvasEvent({ x: 220, y: 240 }));
    dragging.end();

    // then
    expect(subProcess.attachers).not.to.include(label);
    expect(subProcess.attachers).to.include(boundaryEvent);

    expect(boundaryEvent.host).to.eql(subProcess);
    expect(label.host).to.not.exist;
  }));


  it('should only move label when moving BoundaryEvent and Label',
    inject(function(elementRegistry, move, dragging, selection) {
    // given
    var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
        subProcess = elementRegistry.get('SubProcess_1'),
        label = boundaryEvent.label;

    // when
    selection.select([ boundaryEvent, label ]);

    move.start(canvasEvent({ x: 190, y: 355 }), boundaryEvent);

    dragging.hover({
      element: subProcess,
      gfx: elementRegistry.getGraphics(subProcess)
    });

    dragging.move(canvasEvent({ x: 220, y: 240 }));
    dragging.end();

    // then
    expect(subProcess.attachers).not.to.include(label);
    expect(subProcess.attachers).to.include(boundaryEvent);

    expect(boundaryEvent.host).to.eql(subProcess);
    expect(label.host).to.not.exist;
  }));


  it('should move BoundaryEvent and Label with parent', inject(function(canvas, elementRegistry, move, dragging) {
    // given
    var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
        subProcess = elementRegistry.get('SubProcess_1'),
        label = boundaryEvent.label,
        root = canvas.getRootElement();

    // when
    move.start(canvasEvent({ x: 190, y: 355 }), subProcess);

    dragging.hover({
      element: root,
      gfx: elementRegistry.getGraphics(root)
    });
    dragging.move(canvasEvent({ x: 290, y: 455 }));
    dragging.end();

    // then
    expect(subProcess.x).to.eql(304);
    expect(subProcess.y).to.eql(178);

    expect(subProcess.attachers).not.to.include(label);
    expect(subProcess.attachers).to.include(boundaryEvent);

    expect(boundaryEvent.host).to.eql(subProcess);
    expect(label.host).to.not.exist;
  }));


  it('should move BoundaryEvent, Label and parent',
    inject(function(canvas, elementRegistry, move, dragging, selection) {
    // given
    var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
        subProcess = elementRegistry.get('SubProcess_1'),
        label = boundaryEvent.label,
        root = canvas.getRootElement();

    // when
    selection.select([ boundaryEvent, label, subProcess ]);

    move.start(canvasEvent({ x: 190, y: 355 }), subProcess);

    dragging.hover({
      element: root,
      gfx: elementRegistry.getGraphics(root)
    });
    dragging.move(canvasEvent({ x: 290, y: 455 }));
    dragging.end();

    // then
    expect(subProcess.x).to.eql(304);
    expect(subProcess.y).to.eql(178);

    expect(subProcess.attachers).not.to.include(label);
    expect(subProcess.attachers).to.include(boundaryEvent);

    expect(boundaryEvent.host).to.eql(subProcess);
    expect(label.host).to.not.exist;
  }));

});
