import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  getOrientation
} from 'diagram-js/lib/layout/LayoutUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('modeling/behavior - AdaptiveLabelPositioningBehavior', function() {

  var diagramXML = require('./AdaptiveLabelPositioningBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      modelingModule,
      coreModule
    ]
  }));


  function expectLabelOrientation(element, expectedOrientation) {

    var label = element.label;

    // assume
    expect(label).to.exist;

    // when
    var orientation = getOrientation(label, element);

    // then
    expect(orientation).to.eql(expectedOrientation);
  }


  describe('on connect', function() {

    it('should move label from LEFT to TOP', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelBottom'),
          target = elementRegistry.get('LabelLeft');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(source, 'bottom');
      expectLabelOrientation(target, 'top');
    }));


    it('should move label from BOTTOM to TOP', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelBottom'),
          target = elementRegistry.get('LabelRight');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(source, 'top');
      expectLabelOrientation(target, 'right');
    }));


    it('should move label from RIGHT to TOP', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelRight'),
          target = elementRegistry.get('LabelTop');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(source, 'top');
      expectLabelOrientation(target, 'top');
    }));


    it('should move label from TOP to LEFT', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelTop'),
          target = elementRegistry.get('LabelLeft');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(source, 'left');
      expectLabelOrientation(target, 'left');
    }));


    it('should move label from TOP to LEFT', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelTop'),
          target = elementRegistry.get('LabelLeft');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(source, 'left');
      expectLabelOrientation(target, 'left');
    }));


    it('should move label from TOP to LEFT (inverse)', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelLeft'),
          target = elementRegistry.get('LabelTop');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(target, 'left');
      expectLabelOrientation(source, 'left');
    }));


    it('should keep unaligned labels AS IS', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelBottomLeft'),
          target = elementRegistry.get('LabelTop');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(source, 'bottom');
      expectLabelOrientation(target, 'top');
    }));


    it('should keep label where it is, if no options', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelImpossible'),
          target = elementRegistry.get('Task');

      // when
      modeling.connect(source, target);

      // then
      expectLabelOrientation(source, 'right');
    }));

  });


  describe('on reconnect', function() {

    it('should move label from TOP to BOTTOM', inject(function(elementRegistry, modeling) {

      // given
      var connection = elementRegistry.get('SequenceFlow_1'),
          source = elementRegistry.get('LabelTop'),
          target = elementRegistry.get('LabelLeft');

      // when
      modeling.reconnectEnd(connection, target, { x: target.x + target.width / 2, y: target.y });

      // then
      expectLabelOrientation(source, 'bottom');
      expectLabelOrientation(target, 'left');
    }));

  });


  describe('on target move / layout', function() {

    it('should move label from TOP to BOTTOM', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('LabelTop'),
          target = elementRegistry.get('LabelBottom_3');

      // when
      modeling.moveElements([ source ], { x: 0, y: 300 });

      // then
      expectLabelOrientation(source, 'bottom');
      expectLabelOrientation(target, 'top');
    }));

  });


  describe('on source move / layout', function() {

    it('should move label from BOTTOM to TOP', inject(
      function(elementRegistry, modeling) {

        // given
        var source = elementRegistry.get('LabelTop'),
            target = elementRegistry.get('LabelBottom_3');

        // when
        modeling.moveElements([ target ], { x: 20, y: -300 });

        // then
        expectLabelOrientation(source, 'bottom');
        expectLabelOrientation(target, 'top');
      }
    ));

  });


  describe('on waypoints update', function() {

    it('should move label from RIGHT to TOP', inject(function(elementRegistry, modeling) {

      // given
      var connection = elementRegistry.get('SequenceFlow_2'),
          source = elementRegistry.get('LabelRight'),
          target = elementRegistry.get('LabelBottom');

      // when
      modeling.updateWaypoints(connection, [
        {
          original: { x: 131, y: 248 },
          x: 131,
          y: 248
        },
        {
          x: 250,
          y: 248
        },
        {
          x: 250,
          y: 394
        },
        {
          original: { x: 131, y: 394 },
          x: 131,
          y: 394
        },
      ]);

      // then
      expectLabelOrientation(source, 'top');
      expectLabelOrientation(target, 'bottom');
    }));

  });


  describe('on label creation', function() {

    it('should create label at TOP', inject(
      function(elementRegistry, modeling) {

        // given
        var element = elementRegistry.get('NoLabel');

        // when
        modeling.updateProperties(element, { name: 'FOO BAR' });

        // then
        expectLabelOrientation(element, 'top');
      }
    ));
  });

});
