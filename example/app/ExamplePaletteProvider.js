'use strict';


/**
 * A example palette provider.
 */
function ExamplePaletteProvider(create, elementFactory, lassoTool, palette) {
  this._create = create;
  this._elementFactory = elementFactory;
  this._lassoTool = lassoTool;
  this._palette = palette;

  palette.registerProvider(this);
}

ExamplePaletteProvider.$inject = [ 'create', 'elementFactory', 'lassoTool', 'palette' ];

ExamplePaletteProvider.prototype.getPaletteEntries = function() {
  var create = this._create,
      elementFactory = this._elementFactory,
      lassoTool = this._lassoTool;

  return {
    'lasso-tool': {
      group: 'tools',
      className: 'palette-icon-lasso-tool',
      title: 'Activate Lasso Tool',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create-shape': {
      group: 'create',
      className: 'palette-icon-create-shape',
      title: 'Create Shape',
      action: {
        click: function() {
          var shape = elementFactory.createShape({
            width: 100,
            height: 80
          });

          create.start(event, shape);
        }
      }
    }
  };
};

module.exports = ExamplePaletteProvider;