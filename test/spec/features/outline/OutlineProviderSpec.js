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


    describe('should update dimensions on resize', function() {

      it('sub process', inject(function(elementRegistry, outline, selection, modeling) {

        // given
        var subProcess = elementRegistry.get('SubProcess');
        var outlineShape = outline.getOutline(subProcess);

        selection.select(subProcess);

        // when
        modeling.resizeShape(subProcess, { x: 339, y: 142, width: 250, height: 250 });
        outline.updateShapeOutline(outlineShape, subProcess);

        // then
        expect(outlineShape.getAttribute('width')).to.eql('260');
        expect(outlineShape.getAttribute('height')).to.eql('260');
      }));


      it('group', inject(function(elementRegistry, outline, selection, modeling) {

        // given
        var group = elementRegistry.get('Group');
        var outlineShape = outline.getOutline(group);

        selection.select(group);

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
