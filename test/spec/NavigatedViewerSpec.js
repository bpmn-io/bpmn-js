import { expectToBeAccessible } from '@bpmn-io/a11y';

import NavigatedViewer from 'lib/NavigatedViewer';

import EditorActionsModule from 'lib/features/editor-actions';

import TestContainer from 'mocha-test-container-support';

import {
  createViewer
} from 'test/TestHelper';

var singleStart = window.__env__ && window.__env__.SINGLE_START === 'navigated-viewer';


describe('NavigatedViewer', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  (singleStart ? it.only : it)('should import simple process', function() {
    var xml = require('../fixtures/bpmn/simple.bpmn');
    return createViewer(container, NavigatedViewer, xml).then(function(result) {

      expect(result.error).not.to.exist;
    });
  });


  describe('editor actions support', function() {

    it('should not ship per default', function() {

      // given
      var navigatedViewer = new NavigatedViewer();

      // when
      var editorActions = navigatedViewer.get('editorActions', false);

      // then
      expect(editorActions).not.to.exist;
    });


    it('should ship non-modeling actions if included', function() {

      // given
      var expectedActions = [
        'stepZoom',
        'zoom',
        'moveCanvas',
        'selectElements'
      ];

      var navigatedViewer = new NavigatedViewer({
        additionalModules: [
          EditorActionsModule
        ]
      });

      // when
      var editorActions = navigatedViewer.get('editorActions');

      // then
      var actualActions = editorActions.getActions();

      expect(actualActions).to.eql(expectedActions);
    });
  });


  describe('navigation features', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should include zoomScroll', function() {

      return createViewer(container, NavigatedViewer, xml).then(function(result) {

        var viewer = result.viewer;
        var err = result.error;

        expect(err).not.to.exist;
        expect(viewer.get('zoomScroll')).to.exist;
      });
    });


    it('should include moveCanvas', function() {
      return createViewer(container, NavigatedViewer, xml).then(function(result) {

        var viewer = result.viewer;
        var err = result.error;

        expect(err).not.to.exist;
        expect(viewer.get('moveCanvas')).to.exist;
      });
    });
  });


  describe('accessibility', function() {

    it('should report no issues', async function() {

      // given
      const xml = require('../fixtures/bpmn/simple.bpmn');
      await createViewer(container, NavigatedViewer, xml);

      // then
      await expectToBeAccessible(container);
    });

  });

});
