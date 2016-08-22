'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var pick = require('lodash/object/pick');

var getBBox = require('diagram-js/lib/util/Elements').getBBox;


var bpmnEditorActionsModule = require('../../../../lib/features/editor-actions'),
    modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

var basicXML = require('../../../fixtures/bpmn/simple.bpmn'),
    collaborationXML = require('../../../fixtures/bpmn/collaboration.bpmn');



describe('features/editor-actions', function() {

  describe('#moveToOrigin', function() {

    function testMoveToOrigin(xml) {

      return function() {

        beforeEach(bootstrapModeler(xml, { modules: [ bpmnEditorActionsModule, modelingModule, coreModule ] }));

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

  });

});
