import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import outlineProviderModule from 'lib/features/outline';

import diagramXml from './OutlineProvider.bpmn';

import {
  DATA_OBJECT_REFERENCE_OUTLINE_PATH,
  DATA_STORE_REFERENCE_OUTLINE_PATH
} from 'lib/features/outline/OutlineUtil';

import {
  query as domQuery
} from 'min-dom';

describe('features/outline - outline provider', function() {
  var testModules = [
    coreModule,
    modelingModule,
    outlineProviderModule
  ];


  beforeEach(bootstrapModeler(diagramXml, { modules: testModules }));

  describe('should provide outline for', function() {

    it('event', inject(function(elementRegistry, outline) {

      // given
      var event = elementRegistry.get('Event');

      // when
      var outlineShape = outline.getOutline(event);

      // then
      expect(outlineShape).to.exist;
      expect(outlineShape.tagName).to.eql('circle');
    }));


    it('task', inject(function(elementRegistry, outline) {

      // given
      var task = elementRegistry.get('Task');

      // when
      var outlineShape = outline.getOutline(task);

      // then
      expect(outlineShape).to.exist;
      expect(outlineShape.tagName).to.eql('rect');
    }));


    it('call activity', inject(function(elementRegistry, outline) {

      // given
      var callActivity = elementRegistry.get('CallActivity');

      // when
      var outlineShape = outline.getOutline(callActivity);

      // then
      expect(outlineShape).to.exist;
      expect(outlineShape.tagName).to.eql('rect');
    }));


    it('gateway', inject(function(elementRegistry, outline) {

      // given
      var gateway = elementRegistry.get('Gateway');

      // when
      var outlineShape = outline.getOutline(gateway);

      // then
      expect(outlineShape).to.exist;
      expect(outlineShape.tagName).to.eql('rect');
      expect(outlineShape.style.transform).to.eql('rotate(45deg)');
    }));


    it('sub process', inject(function(elementRegistry, outline) {

      // given
      var subProcess = elementRegistry.get('SubProcess');

      // when
      var outlineShape = outline.getOutline(subProcess);

      // then
      expect(outlineShape).to.exist;
      expect(outlineShape.tagName).to.eql('rect');
    }));


    it('data object', inject(function(elementRegistry, outline) {

      // given
      var dataObject = elementRegistry.get('DataObject');

      // when
      var outlineShape = outline.getOutline(dataObject);

      // then
      expect(outlineShape).to.exist;
      expect(outlineShape.tagName).to.eql('path');
      expect(outlineShape.getAttribute('d')).to.eql(DATA_OBJECT_REFERENCE_OUTLINE_PATH);
    }));


    it('data store', inject(function(elementRegistry, outline) {

      // given
      var dataStore = elementRegistry.get('DataStore');

      // when
      var outlineShape = outline.getOutline(dataStore);

      // then
      expect(outlineShape).to.exist;
      expect(outlineShape.tagName).to.eql('path');
      expect(outlineShape.getAttribute('d')).to.eql(DATA_STORE_REFERENCE_OUTLINE_PATH);
    }));

  });


  describe('update', function() {

    describe('should update label', function() {

      var DELTA = 3;

      it('should update label according to label dimentions', inject(function(elementRegistry, selection, modeling) {

        // given
        var event = elementRegistry.get('Event');
        var externalLabel = event.label;

        selection.select(externalLabel);
        var outlineShape = domQuery('.selected .djs-outline', outlineShape);

        // then
        let bounds = outlineShape.getBoundingClientRect();
        expect(bounds.width).to.be.closeTo(34, DELTA);
        expect(bounds.height).to.be.closeTo(24, DELTA);

        // when
        modeling.updateLabel(externalLabel, 'fooooooooooooooo');

        // then
        bounds = outlineShape.getBoundingClientRect();
        expect(bounds.width).to.be.closeTo(93, DELTA);
        expect(bounds.height).to.be.closeTo(37, DELTA);
      }));

    });


    describe('should update dimensions on resize', function() {

      it('sub process', inject(function(elementRegistry, outline, modeling) {

        // given
        var subProcess = elementRegistry.get('SubProcess');
        var outlineShape = outline.getOutline(subProcess);

        // when
        modeling.resizeShape(subProcess, { x: 339, y: 142, width: 250, height: 250 });
        outline.updateShapeOutline(outlineShape, subProcess);

        // then
        expect(outlineShape.getAttribute('width')).to.eql('260');
        expect(outlineShape.getAttribute('height')).to.eql('260');
      }));


      it('group', inject(function(elementRegistry, outline, modeling) {

        // given
        var group = elementRegistry.get('Group');
        var outlineShape = outline.getOutline(group);

        // when
        modeling.resizeShape(group, { x: 339, y: 142, width: 250, height: 250 });
        outline.updateShapeOutline(outlineShape, group);

        // then
        expect(outlineShape.getAttribute('width')).to.eql('260');
        expect(outlineShape.getAttribute('height')).to.eql('260');
      }));

    });

  });
});
