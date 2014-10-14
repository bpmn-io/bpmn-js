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
 * @param minimumSize - optional parameter if set the element bbox will not be smaller then specified.
 * </p>
 *
 */
function createResizeBBox(direction, bbox, mouseDelta, minimumSize) {
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

  if (!!minimumSize) {
    newBBox = respectMinimumSize(newBBox, minimumSize, direction);
  }

  // make sure box size is positive
  newBBox.width  = newBBox.width  < 1 ? 15 : newBBox.width;
  newBBox.height = newBBox.height < 1 ? 15 : newBBox.height;

  return newBBox;
}

function respectMinimumSize(bbox, minSize, direction) {

  var newBBox = {
    height: bbox.height,
    width:  bbox.width,
    x:      bbox.x,
    y:      bbox.y
  };

  var dx = Math.max(minSize.width, bbox.width) - Math.min(minSize.width, bbox.width),
      dy = Math.max(minSize.height, bbox.height) - Math.min(minSize.height, bbox.height);

  if (bbox.width < minSize.width) {

    newBBox.width = minSize.width;
    if (direction === 'nw') {
      newBBox.x = bbox.x - dx;
    } else if (direction === 'sw') {
      newBBox.x = bbox.x - dx;
    }
    newBBox.correctedX = true;
  }

  if (bbox.height < minSize.height) {

    newBBox.height = minSize.height;
    if (direction === 'nw') {
      newBBox.y = bbox.y - dy;
    } else if (direction === 'ne') {
      newBBox.y = bbox.y - dy;
    }
    newBBox.correctedY = true;
  }

  return newBBox;
}


module.exports.createResizeBBox = createResizeBBox;
module.exports.respectMinimumSize = respectMinimumSize;
