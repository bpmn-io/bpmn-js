'use strict';

var Diagram = require('diagram-js');

var container = document.getElementById('container');

var diagram = new Diagram({
  canvas: { container: container },
  modules: [
    require('diagram-js/lib/features/selection'), // select elements
    require('diagram-js/lib/navigation/zoomscroll'), // zoom canvas
    require('diagram-js/lib/navigation/movecanvas'), // scroll canvas
    require('diagram-js/lib/features/modeling'), // basic modeling (create/move/remove shapes/connections)
    require('diagram-js/lib/features/move'), // move shapes
    require('diagram-js/lib/features/outline'), // show element outlines
    require('diagram-js/lib/features/lasso-tool'), // lasso tool for element selection
    require('diagram-js/lib/features/palette'), // palette
    require('diagram-js/lib/features/create'), // create elements
    require('diagram-js/lib/features/context-pad'), // context pad for elements,
    require('diagram-js/lib/features/connect'), // connect elements
    require('diagram-js/lib/features/rules'), // rules
    {
      __init__: [ 'exampleContextPadProvider', 'examplePaletteProvider', 'exampleRuleProvider' ],
      exampleContextPadProvider: [ 'type', require('./ExampleContextPadProvider') ],
      examplePaletteProvider: [ 'type', require('./ExamplePaletteProvider') ],
      exampleRuleProvider: [ 'type', require('./ExampleRuleProvider') ]
    }
  ]
});

// get instances from diagram
var canvas = diagram.get('canvas'),
    defaultRenderer = diagram.get('defaultRenderer'),
    elementFactory = diagram.get('elementFactory'),
    styles = diagram.get('styles');

// override default stroke color
defaultRenderer.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: '#000' });
defaultRenderer.SHAPE_STYLE = styles.style({ fill: 'white', stroke: '#000', strokeWidth: 2 });

// add root
var root = elementFactory.createRoot();

canvas.setRootElement(root);

// add shapes
var shape1 = elementFactory.createShape({
  x: 200,
  y: 100,
  width: 100,
  height: 80
});

canvas.addShape(shape1, root);

var shape2 = elementFactory.createShape({
  x: 300,
  y: 200,
  width: 100,
  height: 80
});

canvas.addShape(shape2, root);