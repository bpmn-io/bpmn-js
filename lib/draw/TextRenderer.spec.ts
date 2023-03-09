import TextRenderer from './TextRenderer';

// instantiate

new TextRenderer({
  defaultStyle: {
    fontFamily: 'foo'
  }
});


// api

const textRenderer = new TextRenderer();

textRenderer.createText('FOO\nBar', {
  align: 'center-top'
});

const defaultStyle = textRenderer.getDefaultStyle();

const externalStyle = textRenderer.getExternalStyle();

const { width, height } = textRenderer.getExternalLabelBounds({
  width: 100,
  height: 20
}, 'FOO\nBAR\n\WOOP');
