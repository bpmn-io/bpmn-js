import TextRenderer from './TextRenderer';

new TextRenderer({
  defaultStyle: {
    fontFamily: 'foo'
  }
});

const textRenderer = new TextRenderer();

const externalLabelBounds = textRenderer.getExternalLabelBounds({
  x: 100,
  y: 100,
  width: 100,
  height: 100
}, 'FOO\nBAR\n\BAZ');

const textAnnotationBounds = textRenderer.getTextAnnotationBounds({
  x: 100,
  y: 100,
  width: 100,
  height: 100
}, 'FOO\nBAR\n\BAZ');

let text = textRenderer.createText('foo');

text = textRenderer.createText('foo', {
  align: 'center-top',
  padding: 10
});

const defaultStyle = textRenderer.getDefaultStyle();

const externalStyle = textRenderer.getExternalStyle();