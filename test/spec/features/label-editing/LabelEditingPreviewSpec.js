import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';

var pick = require('min-dash').pick;

import labelEditingModule from 'lib/features/label-editing';
import coreModule from 'lib/core';
import draggingModule from 'diagram-js/lib/features/dragging';
import modelingModule from 'lib/features/modeling';


describe('features - label-editing preview', function() {

  var diagramXML = require('./LabelEditing.bpmn');

  beforeEach(bootstrapViewer(diagramXML, {
    modules: [
      labelEditingModule,
      coreModule,
      draggingModule,
      modelingModule
    ]
  }));


  describe('activate', function() {

    it('[external labels AND text annotations ] should add marker to hide element on activate', inject(
      function(directEditing, elementRegistry) {

        // given
        var textAnnotation = elementRegistry.get('TextAnnotation_1');

        // when
        directEditing.activate(textAnnotation);

        // then
        var gfx = elementRegistry.getGraphics(textAnnotation);

        expect(gfx.classList.contains('djs-element-hidden')).to.be.true;
      }
    ));


    it('[internal labels] should add marker to hide label on activate', inject(
      function(directEditing, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        // when
        directEditing.activate(task);

        // then
        var gfx = elementRegistry.getGraphics(task);

        expect(gfx.classList.contains('djs-label-hidden')).to.be.true;
      }
    ));

  });


  describe('resize', function() {

    it('[text annotations] should resize preview on resize', inject(
      function(directEditing, elementRegistry, eventBus, labelEditingPreview) {

        // given
        var textAnnotation = elementRegistry.get('TextAnnotation_1');
        directEditing.activate(textAnnotation);

        // when
        eventBus.fire('directEditing.resize', {
          width: 200,
          height: 200,
          dx: 100,
          dy: 100
        });

        // then
        var bounds = bbox(labelEditingPreview.path);

        expect(bounds).to.eql({ x: 0, y: 0, width: 10, height: 300 });
      }
    ));


    it('[text annotations] should resize preview below 0', inject(
      function(directEditing, elementRegistry, eventBus, labelEditingPreview) {

        // given
        var textAnnotation = elementRegistry.get('TextAnnotation_1');
        directEditing.activate(textAnnotation);

        // when
        eventBus.fire('directEditing.resize', {
          width: 200,
          height: 200,
          dx: -300,
          dy: -300
        });

        // then
        var bounds = bbox(labelEditingPreview.path);

        expect(bounds).to.eql({ x: 0, y: 0, width: 10, height: 0 });
      }
    ));

  });


  describe('complete/cancel', function() {

    it('[external labels AND text annotations] should remove marker to hide element on complete', inject(
      function(directEditing, elementRegistry) {

        // given
        var textAnnotation = elementRegistry.get('TextAnnotation_1');
        directEditing.activate(textAnnotation);

        // when
        directEditing.complete();

        // then
        var gfx = elementRegistry.getGraphics(textAnnotation);

        expect(gfx.classList.contains('djs-element-hidden')).to.be.false;
      }
    ));


    it('[internal labels] should remove marker to hide label on complete', inject(
      function(directEditing, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');
        directEditing.activate(task);

        // when
        directEditing.complete();

        // then
        var gfx = elementRegistry.getGraphics(task);

        expect(gfx.classList.contains('djs-label-hidden')).to.be.false;
      }
    ));

  });

});



function bbox(el) {
  return pick(el.getBBox(), [ 'x', 'y', 'width', 'height' ]);
}