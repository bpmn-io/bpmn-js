import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

var pick = require('min-dash').pick;

var getBBox = require('diagram-js/lib/util/Elements').getBBox;

var getParent = require('lib/features/modeling/util/ModelingUtil').getParent;


import bpmnEditorActionsModule from 'lib/features/editor-actions';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

var basicXML = require('../../../fixtures/bpmn/nested-subprocesses.bpmn');
var collaborationXML = require('../../../fixtures/bpmn/collaboration.bpmn');



describe('features/editor-actions', function() {

  describe('#moveToOrigin', function() {

    function testMoveToOrigin(xml) {

      return function() {

        beforeEach(bootstrapModeler(xml, {
          modules: [
            bpmnEditorActionsModule,
            modelingModule,
            coreModule
          ]
        }));


        it('should move to origin', inject(function(editorActions) {

          // given
          var elements = editorActions.trigger('selectElements'),
              boundingBox;

          // when
          editorActions.trigger('moveToOrigin');

          boundingBox = getBBox(elements);

          // then
          expect(pick(boundingBox, [ 'x', 'y' ])).to.eql({ x: 0, y: 0 });
        }));

      };

    }


    describe('single process', testMoveToOrigin(basicXML));


    describe('collaboration', testMoveToOrigin(collaborationXML));


    describe('subprocesses', function() {

      beforeEach(bootstrapModeler(basicXML, {
        modules: [
          bpmnEditorActionsModule,
          modelingModule,
          coreModule
        ]
      }));

      it('should ignore children of subprocesses', inject(
        function(editorActions, elementRegistry) {

          // given
          var startEvent = elementRegistry.get('StartEvent_3'),
              startEventParent = getParent(startEvent);

          // when
          editorActions.trigger('moveToOrigin');

          // then
          expect(getParent(startEvent)).to.equal(startEventParent);
        }
      ));

    });

  });

});
