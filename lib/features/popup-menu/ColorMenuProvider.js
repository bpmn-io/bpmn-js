var COLORS = [{
  title: 'Default',
  fill: undefined,
  stroke: undefined
}, {
  title: 'Blue',
  fill: 'rgb(187, 222, 251)',
  stroke: 'rgb(30, 136, 229)'
}, {
  title: 'Orange',
  fill: 'rgb(255, 224, 178)',
  stroke: 'rgb(251, 140, 0)'
}, {
  title: 'Green',
  fill: 'rgb(200, 230, 201)',
  stroke: 'rgb(67, 160, 71)'
}, {
  title: 'Red',
  fill: 'rgb(255, 205, 210)',
  stroke: 'rgb(229, 57, 53)'
}, {
  title: 'Purple',
  fill: 'rgb(225, 190, 231)',
  stroke: 'rgb(142, 36, 170)'
}];


export default function ColorMenuProvider(popupMenu, modeling, translate) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;

  this.register();
}

ColorMenuProvider.prototype.register = function() {
  this._popupMenu.registerProvider('bjs-color-picker', this);
};

ColorMenuProvider.prototype.getEntries = function() {
  return [];
};

ColorMenuProvider.prototype.getHeaderEntries = function(elements) {
  var modeling = this._modeling;
  var translate = this._translate;

  return COLORS.map(function(color) {
    return {
      id: color.title.toLowerCase() + '-color',
      title: translate(color.title),
      className: 'bjs-color-icon-' + color.title.toLowerCase(),
      action: function() {
        modeling.setColor(elements, {
          fill: color.fill,
          stroke: color.stroke
        });
      }
    };
  });
};

ColorMenuProvider.$inject = ['popupMenu', 'modeling', 'translate'];
