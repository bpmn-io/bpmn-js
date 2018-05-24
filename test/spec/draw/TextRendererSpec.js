import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('draw - TextRenderer', function() {

  var diagramXML = require('./TextRenderer.bpmn');


  describe('API', function() {

    beforeEach(bootstrapViewer(diagramXML));

    it('should expose #createText', inject(function(textRenderer) {

      // when
      var text = textRenderer.createText('FOO');

      // then
      expect(text).to.exist;
    }));


    it('should expose #getLayoutedBounds', inject(function(textRenderer) {

      // given
      var bounds = {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      };

      // when
      var layoutedBounds = textRenderer.getLayoutedBounds(
        bounds,
        'FOO\nBar\nFOOBAR'
      );

      // then
      expect(layoutedBounds).to.exist;

      expect(layoutedBounds.x).to.exist;
      expect(layoutedBounds.y).to.exist;
      expect(layoutedBounds.width).to.exist;
      expect(layoutedBounds.height).to.exist;
    }));

  });


  describe('style override', function() {

    beforeEach(bootstrapViewer(diagramXML, {
      textRenderer: {
        defaultStyle: {
          fontFamily: 'monospace',
          fontSize: '15px'
        },
        externalStyle: {
          fontWeight: 'bold'
        }
      }
    }));


    it('should render', inject(function(textRenderer) {

      // when
      var defaultStyle = textRenderer.getDefaultStyle();
      var externalStyle = textRenderer.getExternalStyle();

      // then
      expect(defaultStyle.fontFamily).to.eql('monospace');
      expect(defaultStyle.fontSize).to.eql('15px');

      expect(externalStyle.fontFamily).to.eql('monospace');
      expect(externalStyle.fontSize).to.eql(14);
      expect(externalStyle.fontWeight).to.eql('bold');
    }));

  });

});