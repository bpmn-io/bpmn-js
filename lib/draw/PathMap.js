/**
 * Map containing SVG paths needed by BpmnRenderer.
 */
var bpmnModule = require('../di').defaultModule;
require('diagram-js/lib/draw/Snap');

function PathMap(Snap) {

  /**
   * Contains a map of path elements
   *
   * <h1>Path definition</h1>
   * A parameterized path is defined like this:
   * <pre>
   * 'GATEWAY_PARALLEL': {
   *   d: 'm {mx},{my} {e.x0},0 0,{e.x1} {e.x1},0 0,{e.y0} -{e.x1},0 0,{e.y1} ' +
          '-{e.x0},0 0,-{e.y1} -{e.x1},0 0,-{e.y0} {e.x1},0 z',
   *   height: 17.5,
   *   width:  17.5,
   *   heightElements: [2.5, 7.5],
   *   widthElements: [2.5, 7.5]
   * }
   * </pre>
   * <p>It's important to specify a correct <b>height and width</b> for the path as the scaling
   * is based on the ratio between the specified height and width in this object and the
   * height and width that is set as scale target (Note x,y coordinates will be scaled with
   * individual ratios).</p>
   * <p>The '<b>heightElements</b>' and '<b>widthElements</b>' array must contain the values that will be scaled.
   * The scaling is based on the computed ratios.
   * Coordinates on the y axis should be in the <b>heightElement</b>'s array, they will be scaled using
   * the computed ratio coefficient.
   * In the parameterized path the scaled values can be accessed through the 'e' object in {} brackets.
   *   <ul>
   *    <li>The values for the y axis can be accessed in the path string using {e.y0}, {e.y1}, ....</li>
   *    <li>The values for the x axis can be accessed in the path string using {e.x0}, {e.x1}, ....</li>
   *   </ul>
   *   The numbers x0, x1 respectively y0, y1, ... map to the corresponding array index.
   * </p>
   */
  this.pathMap = {
    'EVENT_MESSAGE': {
      d: 'm {mx},{my} l 0,{e.y1} l {e.x1},0 l 0,-{e.y1} z l {e.x0},{e.y0} l {e.x0},-{e.y0}',
      height: 36,
      width:  36,
      heightElements: [6, 14],
      widthElements: [10.5, 21]
    },
    'EVENT_SIGNAL': {
      d: 'M {mx},{my} l {e.x0},{e.y0} l -{e.x1},0 Z',
      height: 36,
      width: 36,
      heightElements: [18],
      widthElements: [10, 20]
    },
    'EVENT_ESCALATION': {
      d: 'm {mx},{my} c -{e.x1},{e.y0} -{e.x3},{e.y1} -{e.x5},{e.y4} {e.x1},-{e.y3} {e.x3},-{e.y5} {e.x5},-{e.y6} ' +
        '{e.x0},{e.y3} {e.x2},{e.y5} {e.x4},{e.y6} -{e.x0},-{e.y0} -{e.x2},-{e.y1} -{e.x4},-{e.y4} z',
      height: 36,
      width: 36,
      heightElements: [2.382, 4.764, 4.926, 6.589333, 7.146, 13.178667, 19.768],
      widthElements: [2.463, 2.808, 4.926, 5.616, 7.389, 8.424]
    },
    'EVENT_CONDITIONAL': {
      d: 'M {e.x0},{e.y0} l {e.x1},0 l 0,{e.y2} l -{e.x1},0 Z ' +
         'M {e.x2},{e.y3} l {e.x0},0 ' +
         'M {e.x2},{e.y4} l {e.x0},0 ' +
         'M {e.x2},{e.y5} l {e.x0},0 ' +
         'M {e.x2},{e.y6} l {e.x0},0 ' +
         'M {e.x2},{e.y7} l {e.x0},0 ' +
         'M {e.x2},{e.y8} l {e.x0},0 ',
      height: 36,
      width:  36,
      heightElements: [8.5, 14.5, 18, 11.5, 14.5, 17.5, 20.5, 23.5, 26.5],
      widthElements:  [10.5, 14.5, 12.5]
    },
    'EVENT_LINK': {
      d: 'm {mx},{my} 0,{e.y0} -{e.x1},0 0,{e.y1} {e.x1},0 0,{e.y0} {e.x0},-{e.y2} -{e.x0},-{e.y2} z',
      height: 36,
      width: 36,
      heightElements: [4.4375, 6.75, 7.8125],
      widthElements: [9.84375, 13.5]
    },
    'EVENT_ERROR': {
      d: 'm {mx},{my} {e.x0},-{e.y0} {e.x1},-{e.y1} {e.x2},{e.y2} {e.x3},-{e.y3} -{e.x4},{e.y4} -{e.x5},-{e.y5} z',
      height: 36,
      width: 36,
      heightElements: [0.023, 8.737, 8.151, 16.564, 10.591, 8.714],
      widthElements: [0.085, 6.672, 6.97, 4.273, 5.337, 6.636]
    },
    'EVENT_CANCEL_45': {
      d: 'm {mx},{my} -{e.x1},0 0,{e.x0} {e.x1},0 0,{e.y1} {e.x0},0 ' +
        '0,-{e.y1} {e.x1},0 0,-{e.y0} -{e.x1},0 0,-{e.y1} -{e.x0},0 z',
      height: 36,
      width: 36,
      heightElements: [4.75, 8.5],
      widthElements: [4.75, 8.5]
    },
    'EVENT_COMPENSATION': {
      d: 'm {mx},{my} {e.x0},-{e.y0} 0,{e.y1} z m {e.x0},0 {e.x0},-{e.y0} 0,{e.y1} z',
      height: 36,
      width: 36,
      heightElements: [5, 10],
      widthElements: [10]
    },
    'EVENT_TIMER_WH': {
      d: 'M {mx},{my} m -{e.x1},-{e.y1} l {e.x1},{e.y1} l {e.x0},-{e.y0}',
      height: 36,
      width:  36,
      heightElements: [3.5,4],
      widthElements: [8.75,10.5]
    },
    'EVENT_MULTIPLE': {
      d:'m {mx},{my} {e.x1},-{e.y0} {e.x1},{e.y0} -{e.x0},{e.y1} -{e.x2},0 z',
      height: 36,
      width:  36,
      heightElements: [6.28099, 12.56199],
      widthElements: [3.1405, 9.42149, 12.56198]
    },
    'EVENT_PARALLEL_MULTIPLE': {
      d:'m {mx},{my} {e.x0},0 0,{e.y1} {e.x1},0 0,{e.y0} -{e.x1},0 0,{e.y1} ' +
        '-{e.x0},0 0,-{e.y1} -{e.x1},0 0,-{e.y0} {e.x1},0 z',
      height: 36,
      width:  36,
      heightElements: [2.56228, 7.68683],
      widthElements: [2.56228, 7.68683]
    },
    'GATEWAY_EXCLUSIVE': {
      d:'m {mx},{my} {e.x0},{e.y0} {e.x1},{e.y0} {e.x2},0 {e.x4},{e.y2} ' +
                    '{e.x4},{e.y1} {e.x2},0 {e.x1},{e.y3} {e.x0},{e.y3} ' +
                    '{e.x3},0 {e.x5},{e.y1} {e.x5},{e.y2} {e.x3},0 z',
      height: 17.5,
      width:  17.5,
      heightElements: [8.5, 6.5312, -6.5312, -8.5],
      widthElements:  [6.5, -6.5, 3, -3, 5, -5]
    },
    'GATEWAY_PARALLEL': {
      d:'m {mx},{my} 0,{e.y1} -{e.x1},0 0,{e.y0} {e.x1},0 0,{e.y1} {e.x0},0 ' +
        '0,-{e.y1} {e.x1},0 0,-{e.y0} -{e.x1},0 0,-{e.y1} -{e.x0},0 z',
      height: 30,
      width:  30,
      heightElements: [5, 12.5],
      widthElements: [5, 12.5]
    },
    'GATEWAY_EVENT_BASED': {
      d:'m {mx},{my} {e.x0},{e.y0} {e.x0},{e.y1} {e.x1},{e.y2} {e.x2},0 z',
      height: 11,
      width:  11,
      heightElements: [-6, 6, 12, -12],
      widthElements: [9, -3, -12]
    },
    'GATEWAY_COMPLEX': {
      d:'m {mx},{my} 0,{e.y0} -{e.x0},-{e.y1} -{e.x1},{e.y2} {e.x0},{e.y1} -{e.x2},0 0,{e.y3} ' +
        '{e.x2},0  -{e.x0},{e.y1} l {e.x1},{e.y2} {e.x0},-{e.y1} 0,{e.y0} {e.x3},0 0,-{e.y0} {e.x0},{e.y1} ' +
        '{e.x1},-{e.y2} -{e.x0},-{e.y1} {e.x2},0 0,-{e.y3} -{e.x2},0 {e.x0},-{e.y1} -{e.x1},-{e.y2} ' +
        '-{e.x0},{e.y1} 0,-{e.y0} -{e.x3},0 z',
      height: 17.125,
      width:  17.125,
      heightElements: [4.875, 3.4375, 2.125, 3],
      widthElements: [3.4375, 2.125, 4.875, 3]
    },
    'DATA_OBJECT_PATH': {
      d:'m 0,0 {e.x1},0 {e.x0},{e.y0} 0,{e.y1} -{e.x2},0 0,-{e.y2} {e.x1},0 0,{e.y0} {e.x0},0',
      height: 61,
      width:  51,
      heightElements: [10, 50, 60],
      widthElements: [10, 40, 50, 60]
    },
    'DATA_OBJECT_COLLECTION_PATH': {
      d:'m {mx}, {my} ' +
        'm  0 15  l 0 -15 ' +
        'm  4 15  l 0 -15 ' +
        'm  4 15  l 0 -15 ',
      height: 61,
      width:  51,
      heightElements: [12],
      widthElements: [1, 6, 12, 15]
    },
    'DATA_ARROW': {
      d:'m 5,9 9,0 0,-3 5,5 -5,5 0,-3 -9,0 z',
      height: 61,
      width:  51,
      heightElements: [],
      widthElements: []
    },
    'DATA_STORE': {
      d:'m  {mx},{my} ' +
        'l  0,{e.y2} ' +
        'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0 ' +
        'l  0,-{e.y2} ' +
        'c -{e.x0},-{e.y1} -{e.x1},-{e.y1} -{e.x2},0' +
        'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0 ' +
        'm  0,{e.y0}' +
        'c -{e.x0},{e.y1} -{e.x1},{e.y1} -{e.x2},0' +
        'm  0,{e.y0}' +
        'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0',
      height: 61,
      width:  61,
      heightElements: [7, 10, 45],
      widthElements:  [2, 58, 60]
    },
    'TEXT_ANNOTATION': {
      d: 'm {mx}, {my} m 10,0 l -10,0 l 0,{e.y0} l 10,0',
      height: 30,
      width: 10,
      heightElements: [30],
      widthElements: [10]
    }
  };

  this.getRawPath = function getRawPath(pathId) {
    return this.pathMap[pathId].d;
  };

  /**
   * Scales the path to the given height and width.
   * <h1>Use case</h1>
   * <p>Use case is to scale the content of elements (event, gateways) based
   * on the element bounding box's size.
   * </p>
   * <h1>Why not transform</h1>
   * <p>Scaling a path with transform() will also scale the stroke and IE does not support
   * the option 'non-scaling-stroke' to prevent this.
   * Also there are use cases where only some parts of a path should be
   * scaled.</p>
   *
   * @param {String} pathId The ID of the path.
   * @param {Object} param <p>
   *   Example param object scales the path to 60% size of the container (data.width, data.height).
   *   <pre>
   *   {
   *     xScaleFactor: 0.6,
   *     yScaleFactor:0.6,
   *     containerWidth: data.width,
   *     containerHeight: data.height,
   *     position: {
   *       mx: 0.46,
   *       my: 0.2,
   *     }
   *   }
   *   </pre>
   *   <ul>
   *    <li>targetpathwidth = xScaleFactor * containerWidth</li>
   *    <li>targetpathheight = yScaleFactor * containerHeight</li>
   *    <li>Position is used to set the starting coordinate of the path. M is computed:
    *    <ul>
    *      <li>position.x * containerWidth</li>
    *      <li>position.y * containerHeight</li>
    *    </ul>
    *    Center of the container <pre> position: {
   *       mx: 0.5,
   *       my: 0.5,
   *     }</pre>
   *     Upper left corner of the container
   *     <pre> position: {
   *       mx: 0.0,
   *       my: 0.0,
   *     }</pre>
   *    </li>
   *   </ul>
   * </p>
   *
   */
  this.getScaledPath = function getScaledPath(pathId, param) {
    var rawPath = this.pathMap[pathId];

    // positioning
    // compute the start point of the path
    var mx = param.containerWidth   * param.position.mx;
    var my = param.containerHeight  * param.position.my;

    // path
    var heightRatio = (param.containerHeight / rawPath.height) * param.yScaleFactor;
    var widthRatio  = (param.containerWidth  / rawPath.width)  * param.xScaleFactor;
    var coordinates = {}; //map for the scaled coordinates

    //Apply height ratio
    for(var heightIndex = 0; heightIndex < rawPath.heightElements.length; heightIndex++) {
      coordinates['y' + heightIndex] = rawPath.heightElements[heightIndex] * heightRatio;
    }

    //Apply width ratio
    for(var widthIndex = 0; widthIndex < rawPath.widthElements.length; widthIndex++) {
      coordinates['x' + widthIndex] = rawPath.widthElements[widthIndex] * widthRatio;
    }


    //Apply value to raw path
    var path = Snap.format(
      rawPath.d, {
        mx: mx,
        my: my,
        e: coordinates
      }
    );
    return path;
  };
}

bpmnModule.type('pathMap', [ 'snap', PathMap ]);

module.exports = PathMap;