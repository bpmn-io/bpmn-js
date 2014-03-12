var PaletteDragDrop = require('../../../../src/features/services/PaletteDragDrop');
var Events = require('../../../../src/core/Events');
var TestHelper = require('../../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;

describe('PaletteDragDrop should ', function() {
  'use strict';

  var pdd,
      mockEvents,
      canvas;

  beforeEach(bootstrapDiagram(function() {
    mockEvents = new Events();
    canvas = {
      listeners: {},
      addListener: function(lname, listener) {
        this.listeners[lname] = listener;
      }};
    pdd = new PaletteDragDrop(canvas, mockEvents, 'shapes');

    return {
      events: mockEvents,
      pdd: pdd,
      canvas: canvas
    };
  }));

  it('have listeners registered on init', function() {
    mockEvents.fire('standard.palette.init');
    expect(canvas.listeners.mousemove).toBeDefined();
    expect(canvas.listeners.mouseup).toBeDefined();
  });

  it('set drag status ', function() {
    pdd.startDragAndDrop();
    expect(pdd.isDragInProgress()).toBeTruthy();
  });

});