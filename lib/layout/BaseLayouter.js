'use strict';

var getMid = require('./LayoutUtil').getMid;


/**
 * A base connection layouter implementation
 * that layouts the connection by directly connecting
 * mid(source) + mid(target).
 */
function BaseLayouter() {}

module.exports = BaseLayouter;


/**
 * Return the new layouted waypoints for the given connection.
 *
 * @param {djs.model.Connection} connection
 * @param {Object} hints
 * @param {Boolean} [hints.movedStart=false]
 * @param {Boolean} [hints.movedEnd=false]
 *
 * @return {Array<Point>} the layouted connection waypoints
 */
BaseLayouter.prototype.layoutConnection = function(connection, hints) {
  return [
    getMid(connection.source),
    getMid(connection.target)
  ];
};
