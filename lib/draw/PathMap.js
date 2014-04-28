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
    'shape': {
      d: 'M{x},{y}h{dim.width}v{dim.height}h{dim["negative width"]}z',
      height: 'y',
      width: 'x',
      heightElements: [],
      widthElements: []
    },
    'EVENT_MESSAGE': {
      d: 'M 7.5 10 l 0 15 l 21 0 l 0 -15 z l 10.5 6 l 10.5 -6',
      height: 22,
      width: 16,
      heightElements: [],
      widthElements: []
    },
    'EVENT_MESSAGE_REV': {
      d: 'M 7 9.5 l 10.5,4.5 l 10.5,-4.5',
      height: 4.5,
      width: 6,
      heightElements: [],
      widthElements: []
    },
    'EVENT_SIGNAL': {
      d: 'M 18 8 l 10 18 l -20 0 Z',
      height: 21,
      width: 15,
      heightElements: [],
      widthElements: []
    },
    'EVENT_ESCALATION': {
      d: 'm 19,20 c -2.808,2.382 -5.616,4.764 -8.424,7.146 2.808,-6.589333 5.616,-13.178667 ' +
        '8.424,-19.768 2.463,6.589333 4.926,13.178667 7.389,19.768 -2.463,-2.382 -4.926,-4.764 -7.389,-7.146 z',
      height: 19,
      width: 15,
      heightElements: [],
      widthElements: []
    },
    'EVENT_CONDITIONAL': {
      d: 'M 10.5  8.5 l 14.5 0 l 0 18 l -14.5 0 Z ' +
         'M 12.5 11.5 l 10.5 0 ' +
         'M 12.5 14.5 l 10.5 0 ' +
         'M 12.5 17.5 l 10.5 0 ' +
         'M 12.5 20.5 l  8   0 ' +
         'M 12.5 23.5 l  8   0 ' +
         'M 12.5 26.5 l 10.5 0 ',
      height: 19,
      width: 15,
      heightElements: [],
      widthElements: []
    },
    'EVENT_LINK': {
      d: 'm 20,12 c 2.151333,1.851 4.302667,3.702 6.454,5.553 -2.146667,1.847333 -4.293333,3.694667 ' +
        '-6.44,5.542 0,-0.938667 0,-1.877333 0,-2.816 -3.009,0 -6.018,0 -9.027,0 0,-1.776 0,-3.552 0,-5.328 ' +
        '2.998,0 5.996,0 8.994,0 0.0057,-0.983671 0.01251,-1.967334 0.019,-2.951 z m -0.986,-2.167 ' +
        'c -0.009,1.372667 -0.018,2.745333 -0.027,4.118 -3,0 -6,0 -9,0 0,2.442667 0,4.885333 0,7.328 ' +
        '3.009,0 6.018,0 9.027,0 0,1.332333 0,2.664667 0,3.997 2.991,-2.574 5.982,-5.148 8.973,-7.722 ' +
        '-2.991,-2.573667 -5.982,-5.147333 -8.973,-7.721 z',
      height: 16,
      width: 19,
      heightElements: [],
      widthElements: []
    },
    'EVENT_ERROR': {
      d: 'm 8,25 0.085,-0.023 6.672,-8.737 6.97,8.151 4.273,-16.564 -5.337,10.591 -6.636,-8.714 z',
      height: 19,
      width: 15,
      heightElements: [],
      widthElements: []
    },
    'EVENT_CANCEL': {
      d: 'm 10,24 c 1.874667,-1.874333 3.74933,-3.748667 5.624,-5.623 -1.87467,-1.874 -3.749333,-3.748 ' +
        '-5.624,-5.622 0.890667,-0.890333 1.781333,-1.780667 2.672,-2.671 1.874,1.875 3.748,3.75 5.622,5.625 ' +
        '1.87433,-1.875 3.74867,-3.75 5.623,-5.625 0.88967,0.890333 1.77933,1.780667 2.669,2.671 -1.87333,1.874 ' +
        '-3.74667,3.748 -5.62,5.622 1.87333,1.874333 3.74667,3.748667 5.62,5.623 -0.88967,0.89 -1.77933,1.78 ' +
        '-2.669,2.67 -1.87433,-1.874 -3.74867,-3.748 -5.623,-5.622 -1.874,1.874 -3.748,3.748 -5.622,5.622 ' +
        '-0.890667,-0.89 -1.781333,-1.78 -2.672,-2.67 z',
      height: 22,
      width: 22,
      heightElements: [],
      widthElements: []
    },
    'EVENT_COMPENSATION': {
      d: 'm 25.5,11 -8.038,5.014 0,-5.014 -9.962,6.214 9.962,6.213 0,-5.012 8.038,5.012 z',
      height: 22,
      width: 22,
      heightElements: [],
      widthElements: []
    },
    'EVENT_TIMER_1': {
      d: 'm 18.1,7.7 c 5.676,0 10.292,4.617 10.292,10.293 0,5.676 -4.616,10.293 -10.292,10.293 -5.676,0 ' +
        '-10.293,-4.617 -10.293,-10.293 0,-5.676 4.617,-10.293 10.293,-10.293 m 0,-1.5 c -6.515,0 ' +
        '-11.793,5.279 -11.793,11.793 0,6.514 5.278,11.793 11.793,11.793 6.515,0 11.792,-5.279 ' +
        '11.792,-11.793 0,-6.514 -5.279,-11.793 -11.792,-11.793 l 0,0 z',
      height: 24,
      width: 24,
      heightElements: [],
      widthElements: []
    },
    'EVENT_TIMER_2': {
      d: 'm 18,7 c -6.15,0 -11.139,4.986 -11.139,11.139 0,6.149 4.987,11.139 11.139,11.139 6.15,0 ' +
        '11.14,-4.988 11.14,-11.139 -0.002,-6.151 -4.99,-11.139 -11.14,-11.139 z m 9.452,16.302 ' +
        'c -0.006,-0.004 -0.01,-0.008 -0.015,-0.011 -0.403,-0.229 -0.808,-0.461 -1.212,-0.69 ' +
        '-0.143,-0.08 -0.282,-0.045 -0.358,0.092 -0.077,0.136 -0.036,0.27 0.104,0.352 0.401,0.229 ' +
        '0.803,0.459 1.207,0.688 0.006,0.003 0.011,0.008 0.018,0.01 -0.896,1.466 -2.131,2.7 -3.6,3.596 ' +
        '0,-0.002 -0.001,-0.004 -0.001,-0.007 -0.239,-0.427 -0.479,-0.854 -0.72,-1.279 -0.062,-0.109 ' +
        '-0.161,-0.146 -0.276,-0.112 -0.117,0.033 -0.196,0.134 -0.204,0.252 0.015,0.042 0.025,0.088 ' +
        '0.047,0.129 0.235,0.422 0.473,0.842 0.71,1.262 0.002,0.005 0.006,0.008 0.008,0.012 -1.463,0.801 ' +
        '-3.133,1.271 -4.907,1.312 0.002,-0.486 0.002,-0.974 0,-1.458 0,-0.104 -0.054,-0.183 -0.15,-0.218 ' +
        '-0.172,-0.063 -0.362,0.027 -0.361,0.24 0.005,0.473 10e-4,0.942 10e-4,1.414 0,0.007 0.001,0.013 ' +
        '0.002,0.021 -1.774,-0.043 -3.444,-0.516 -4.906,-1.316 0,-0.002 0.002,-0.003 0.003,-0.005 0.254,-0.409 ' +
        '0.506,-0.818 0.758,-1.229 0.023,-0.037 0.034,-0.085 0.051,-0.127 -0.01,-0.115 -0.084,-0.209 ' +
        '-0.204,-0.244 -0.112,-0.031 -0.218,0.004 -0.282,0.109 -0.254,0.412 -0.509,0.822 -0.76,1.234 ' +
        '-0.003,0.002 -0.003,0.005 -0.004,0.008 -1.466,-0.896 -2.7,-2.128 -3.594,-3.595 0.421,-0.251 ' +
        '0.842,-0.5 1.262,-0.753 0.061,-0.035 0.102,-0.091 0.11,-0.159 0.015,-0.111 -0.024,-0.203 ' +
        '-0.116,-0.27 -0.09,-0.065 -0.182,-0.054 -0.272,0.002 -0.271,0.162 -0.546,0.324 -0.816,0.486 ' +
        '-0.142,0.083 -0.281,0.168 -0.421,0.252 -0.799,-1.463 -1.271,-3.131 -1.312,-4.905 0.475,0 ' +
        '0.95,0.003 1.424,-10e-4 0.056,-0.001 0.119,-0.03 0.164,-0.063 0.081,-0.064 0.102,-0.192 ' +
        '0.061,-0.296 -0.039,-0.098 -0.119,-0.147 -0.235,-0.147 -0.449,0 -0.897,0.003 -1.348,-0.002 ' +
        '-0.023,-0.002 -0.043,0.001 -0.064,0.003 0.041,-1.775 0.513,-3.445 1.312,-4.908 0.006,0.004 ' +
        '0.012,0.011 0.02,0.015 0.408,0.228 0.817,0.456 1.229,0.682 0.043,0.025 0.093,0.038 0.139,0.056 ' +
        '0.12,-0.011 0.22,-0.091 0.255,-0.212 0.03,-0.108 -0.01,-0.21 -0.117,-0.271 -0.074,-0.045 ' +
        '-0.149,-0.086 -0.228,-0.128 -0.342,-0.19 -0.687,-0.381 -1.028,-0.571 -0.007,-0.003 -0.012,-0.004 ' +
        '-0.017,-0.007 0.894,-1.467 2.127,-2.699 3.592,-3.595 0.001,0.002 0.001,0.004 0.004,0.006 ' +
        '0.226,0.404 0.455,0.81 0.685,1.214 0.075,0.134 0.207,0.17 0.343,0.097 0.132,-0.073 0.174,-0.215 ' +
        '0.103,-0.348 -0.013,-0.023 -0.025,-0.045 -0.039,-0.069 -0.215,-0.382 -0.432,-0.764 -0.646,-1.145 ' +
        '-0.003,-0.004 -0.005,-0.008 -0.007,-0.012 1.463,-0.801 3.132,-1.271 4.904,-1.313 -0.001,0.479 ' +
        '-0.001,0.962 0,1.44 10e-4,0.116 0.077,0.202 0.191,0.229 0.182,0.039 0.318,-0.071 0.318,-0.257 ' +
        '0,-0.446 -0.004,-0.893 0.003,-1.337 0,-0.025 -0.001,-0.051 -0.005,-0.075 1.775,0.041 3.444,0.511 ' +
        '4.908,1.312 0,0.002 -0.003,0.003 -0.003,0.006 -0.229,0.42 -0.455,0.842 -0.681,1.263 -0.021,0.037 ' +
        '-0.027,0.081 -0.04,0.119 0.005,0.115 0.09,0.222 0.206,0.255 0.117,0.032 0.214,-0.008 0.273,-0.12 ' +
        '0.151,-0.276 0.301,-0.554 0.45,-0.832 0.078,-0.146 0.159,-0.289 0.231,-0.437 1.469,0.896 ' +
        '2.703,2.13 3.6,3.597 -0.006,0.002 -0.011,0.004 -0.016,0.008 -0.414,0.243 -0.825,0.489 ' +
        '-1.236,0.735 -0.029,0.019 -0.056,0.041 -0.078,0.064 -0.076,0.093 -0.067,0.229 0.017,0.329 ' +
        '0.079,0.095 0.199,0.116 0.312,0.051 0.246,-0.144 0.487,-0.29 0.732,-0.435 0.173,-0.104 ' +
        '0.351,-0.208 0.523,-0.314 h 0.002 c 0.8,1.463 1.272,3.132 1.312,4.909 -0.488,-0.002 -0.979,-0.002 ' +
        '-1.469,0 -0.115,0.001 -0.201,0.076 -0.226,0.19 -0.039,0.181 0.071,0.317 0.256,0.317 0.472,0 0.942,0 ' +
        '1.415,0 0.007,0 0.016,0 0.022,-0.001 -0.042,1.772 -0.512,3.441 -1.313,4.906 z',
      height: 22,
      width:  23,
      heightElements: [],
      widthElements: []
    },
    'EVENT_TIMER_WH': {
      d: 'm 20,9 -1.058,-0.236 -1.974,8.849 -0.286,0 0,1.041 0.055,0 -0.055,0.244 1.06,0.236 ' +
         '0.105,-0.48 5.68,0 0,-1.041 -5.447,0 z',
      height: 12,
      width:  8,
      heightElements: [],
      widthElements: []
    },
    'EVENT_MULTIPLE': {
      d:'m 8,14 9.42149,-6.28099 9.42149,6.28099 -3.1405,12.56199 -12.56198,0 z',
      height: 18,
      width:  18,
      heightElements: [],
      widthElements: []
    },
    'EVENT_PARALLEL_MULTIPLE': {
      d:'m 17,9 2.56228,0 0,7.686833 7.68683,0 0,2.562278 -7.68683,0 0,7.686833 ' +
        '-2.56228,0 0,-7.686833 -7.686832,0 0,-2.562278 7.686832,0 z',
      height: 17,
      width:  17,
      heightElements: [],
      widthElements: []
    },
    'GATEWAY_EXCLUSIVE': {
      //m 0,0 6.5,8.5 -6.5,8.5 3,0 5,-6.5312 5,6.5312 3,0 -6.5,-8.5 6.5,-8.5 -3,0 -5,6.5313 -5,-6.5313 -3,0 z
      d:'m {mx},{my} {e.x0},{e.y0} {e.x1},{e.y0} {e.x2},0 {e.x4},{e.y2} ' +
                    '{e.x4},{e.y1} {e.x2},0 {e.x1},{e.y3} {e.x0},{e.y3} ' +
                    '{e.x3},0 {e.x5},{e.y1} {e.x5},{e.y2} {e.x3},0 z',
      height: 17.5,
      width:  17.5,
      heightElements: [8.5, 6.5312, -6.5312, -8.5],
      widthElements:  [6.5, -6.5, 3, -3, 5, -5]
    },
    'GATEWAY_PARALLEL': {
      d:'m {mx},{my} {e.x0},0 0,{e.x1} {e.x1},0 0,{e.y0} -{e.x1},0 0,{e.y1} ' +
        '-{e.x0},0 0,-{e.y1} -{e.x1},0 0,-{e.y0} {e.x1},0 z',
      height: 17.125,
      width:  16.125,
      heightElements: [2.5, 7.5],
      widthElements: [2.5, 7.5]
    },
    'GATEWAY_EVENT_BASED': {
      //d:'m {mx},{my} 9.42149,-6.28099 9.42149,6.28099 -3.1405,12.56199 -12.56198,0 z',
      d:'m {mx},{my} {e.x0},{e.y0} {e.x0},{e.y1} {e.x1},{e.y2} {e.x2},0 z',
      height: 11,
      width:  11,
      heightElements: [-6, 6, 12, -12],
      widthElements: [9, -3, -12]
    },
    'GATEWAY_COMPLEX': {
      //d:'m 7.0625,0.0625 0,4.8750001 -3.4375,-3.4375 -2.125,2.125 3.4375,3.4375 -4.875,0
      // 0,2.9999999 4.875,0 L 1.5,13.5 l 2.125,2.125 3.4375,-3.4375 0,4.875 3,0 0,-4.875
      // 3.4375,3.4375 2.125,-2.125 -3.4375,-3.4375 4.875,0 0,-2.9999999 -4.875,0 3.4375,-3.4375
      // -2.125,-2.125 -3.4375,3.4375 0,-4.8750001 z',
      d:'m {mx},{my} 0,{e.y0} -{e.x0},-{e.y1} -{e.x1},{e.y2} {e.x0},{e.y1} -{e.x2},0 0,{e.y3} ' +
        '{e.x2},0  -{e.x0},{e.y1} l {e.x1},{e.y2} {e.x0},-{e.y1} 0,{e.y0} {e.x3},0 0,-{e.y0} {e.x0},{e.y1} ' +
        '{e.x1},-{e.y2} -{e.x0},-{e.y1} {e.x2},0 0,-{e.y3} -{e.x2},0 {e.x0},-{e.y1} -{e.x1},-{e.y2} ' +
        '-{e.x0},{e.y1} 0,-{e.y0} -{e.x3},0 z',
      height: 17.125,
      width:  17.125,
      heightElements: [4.875, 3.4375, 2.125, 3],
      widthElements: [3.4375, 2.125, 4.875, 3]
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
    var heightRatio = (param.containerHeight * param.yScaleFactor) / rawPath.height;
    var widthRatio  = (param.containerWidth  * param.xScaleFactor) / rawPath.width;
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