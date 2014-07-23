'use strict';


function getMidPoint(bounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  };
}


function Layouter() {}

module.exports = Layouter;


Layouter.prototype.getConnectionWaypoints = function(connection) {
  return [
    getMidPoint(connection.source),
    getMidPoint(connection.target)
  ];
};