var _ = require('lodash');


/**
 * Util function to create a new

 * @param direction - supported resize direction: <ul>
 *   <li>nw - north west<li>
 *   <li>ne - north east<li>
 *   <li>se - south east<li>
 *   <li>sw - south west<li>
 *  <ul>
 * @param bbox - of the object that should be resized
 * @param mouseDelta - delta between start and end of move event <p>
 * mouseDelta = &#x7B;dx: start.x - end.x, dy: start.y - end.y&#x7D;
 * </p>
 *
 */
function createResizeBBox(direction, bbox, mouseDelta) {
  var dx = mouseDelta.dx;
  var dy = mouseDelta.dy;

  var newBBox = {
    height: null,
    width:  null,
    x:      null,
    y:      null
  };


  if (direction === 'se') {
    _.extend(newBBox, {
      width:  bbox.width  - dx,
      height: bbox.height - dy,
      x:      bbox.x,
      y:      bbox.y
    });

  } else if (direction === 'sw') {
    _.extend(newBBox, {
      width:  bbox.width  + dx,
      height: bbox.height - dy,
      x:      bbox.x - dx,
      y:      bbox.y
    });

  } else if (direction === 'nw') {
    _.extend(newBBox, {
      width:  bbox.width  + dx,
      height: bbox.height + dy,
      x:      bbox.x - dx,
      y:      bbox.y - dy
    });

  } else if (direction === 'ne') {
    _.extend(newBBox, {
      width:  bbox.width  - dx,
      height: bbox.height + dy,
      x:      bbox.x,
      y:      bbox.y - dy
    });
  }

  return newBBox;
}


module.exports.createResizeBBox = createResizeBBox;
