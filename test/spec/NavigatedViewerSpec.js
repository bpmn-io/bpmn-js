import NavigatedViewer from 'lib/NavigatedViewer';

import EditorActionsModule from 'lib/features/editor-actions';

import TestContainer from 'mocha-test-container-support';

import {
  setBpmnJS,
  clearBpmnJS
} from 'test/TestHelper';


describe('NavigatedViewer', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  function createViewer(xml, done) {

    clearBpmnJS();

    var viewer = new NavigatedViewer({
      container: container
    });

    setBpmnJS(viewer);

    viewer.importXML(xml, function(err, warnings) {
      done(err, warnings, viewer);
    });
  }


  it('should import simple process', function(done) {
    var xml = require('../fixtures/bpmn/simple.bpmn');
    createViewer(xml, done);
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

    it('should include zoomScroll', function(done) {

      createViewer(xml, function(err, warnings, viewer) {
        expect(viewer.get('zoomScroll')).to.exist;

        done(err);
      });
    });


    it('should include moveCanvas', function(done) {
      createViewer(xml, function(err, warnings, viewer) {
        expect(viewer.get('moveCanvas')).to.exist;

        done(err);
      });
    });

  });

});
