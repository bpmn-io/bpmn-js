import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';

import autoPlaceModule from 'lib/features/auto-place';
import coreModule from 'lib/core';
import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';


describe('features/grid-snapping - auto-place', function() {

  var diagramXML = require('./AutoPlaceBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      autoPlaceModule,
      coreModule,
      gridSnappingModule,
      modelingModule
    ]
  }));


  describe('flow node', function() {

    it('without existing elements', inject(function(autoPlace, elementFactory, elementRegistry) {

      // given
      var shape1 = elementFactory.createShape({
        id: 'Task_2',
        type: 'bpmn:Task'
      });

      var source = elementRegistry.get('StartEvent_1');

      // when
      autoPlace.append(source, shape1);

      // then
      shape1 = elementRegistry.get('Task_2');

      expect(getMid(shape1)).to.eql({
        x: 220, // 218 snapped to 220
        y: 105 // not snapped
      });
    }));


    it('with existing elements', inject(function(autoPlace, elementFactory, elementRegistry) {

      // given
      var shape1 = elementFactory.createShape({
        id: 'Task_2',
        type: 'bpmn:Task'
      });

      var source = elementRegistry.get('StartEvent_1');

      autoPlace.append(source, shape1);

      var shape2 = elementFactory.createShape({
        id: 'Task_3',
        type: 'bpmn:Task'
      });

      // when
      autoPlace.append(source, shape2);

      // then
      shape2 = elementRegistry.get('Task_3');

      expect(getMid(shape2)).to.eql({
        x: 220, // 220 snapped to 220
        y: 220 // 215 snapped to 220
      });
    }));

  });


  describe('text annotation', function() {

    it('without existing elements', inject(function(autoPlace, elementFactory, elementRegistry) {

      // given
      var shape1 = elementFactory.createShape({
        id: 'TextAnnotation_1',
        type: 'bpmn:TextAnnotation'
      });

      var source = elementRegistry.get('StartEvent_1');

      // when
      autoPlace.append(source, shape1);

      // then
      shape1 = elementRegistry.get('TextAnnotation_1');

      expect(getMid(shape1)).to.eql({
        x: 170, // 168 snapped to 170
        y: 15 // 22 snapped to 15
      });
    }));


    it('with existing elements', inject(function(autoPlace, elementFactory, elementRegistry) {

      // given
      var shape1 = elementFactory.createShape({
        id: 'TextAnnotation_1',
        type: 'bpmn:TextAnnotation'
      });

      var source = elementRegistry.get('StartEvent_1');

      autoPlace.append(source, shape1);

      var shape2 = elementFactory.createShape({
        id: 'TextAnnotation_2',
        type: 'bpmn:TextAnnotation'
      });

      // when
      autoPlace.append(source, shape2);

      // then
      shape2 = elementRegistry.get('TextAnnotation_2');

      expect(getMid(shape2)).to.eql({
        x: 170, // 168 snapped to 170
        y: -45 // -45 snapped to -45
      });
    }));

  });


  describe('data object/store reference', function() {

    it('without existing elements', inject(function(autoPlace, elementFactory, elementRegistry) {

      // given
      var shape1 = elementFactory.createShape({
        id: 'DataObjectReference_1',
        type: 'bpmn:DataObjectReference'
      });

      var source = elementRegistry.get('Task_1');

      // when
      autoPlace.append(source, shape1);

      // then
      shape1 = elementRegistry.get('DataObjectReference_1');

      expect(getMid(shape1)).to.eql({
        x: 160, // 158 snapped to 160
        y: 400 // 398 snapped to 400
      });
    }));


    it('with existing elements', inject(function(autoPlace, elementFactory, elementRegistry) {

      // given
      var shape1 = elementFactory.createShape({
        id: 'DataObjectReference_1',
        type: 'bpmn:DataObjectReference'
      });

      var source = elementRegistry.get('Task_1');

      autoPlace.append(source, shape1);

      var shape2 = elementFactory.createShape({
        id: 'DataObjectReference_2',
        type: 'bpmn:DataObjectReference'
      });

      // when
      autoPlace.append(source, shape2);

      // then
      shape2 = elementRegistry.get('DataObjectReference_2');

      expect(getMid(shape2)).to.eql({
        x: 230, // 226 snapped to 230
        y: 400 // 398 snapped to 400
      });
    }));

  });

});