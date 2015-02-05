'use strict';

var snapsvg = module.exports = require('snapsvg');

snapsvg.plugin(function(Snap, Element) {

  /*\
   * Element.children
   [ method ]
   **
   * Returns array of all the children of the element.
   = (array) array of Elements
  \*/
  Element.prototype.children = function () {
      var out = [],
          ch = this.node.childNodes;
      for (var i = 0, ii = ch.length; i < ii; i++) {
          out[i] = new Snap(ch[i]);
      }
      return out;
  };
});


/**
 * @class ClassPlugin
 *
 * Extends snapsvg with methods to add and remove classes
 */
snapsvg.plugin(function (Snap, Element, Paper, global) {

  function split(str) {
    return str.split(/\s+/);
  }

  function join(array) {
    return array.join(' ');
  }

  function getClasses(e) {
    return split(e.attr('class') || '');
  }

  function setClasses(e, classes) {
    e.attr('class', join(classes));
  }

  /**
   * @method snapsvg.Element#addClass
   *
   * @example
   *
   * e.attr('class', 'selector');
   *
   * e.addClass('foo bar'); // adds classes foo and bar
   * e.attr('class'); // -> 'selector foo bar'
   *
   * e.addClass('fooBar');
   * e.attr('class'); // -> 'selector foo bar fooBar'
   *
   * @param {String} cls classes to be added to the element
   *
   * @return {snapsvg.Element} the element (this)
   */
  Element.prototype.addClass = function(cls) {
    var current = getClasses(this),
        add = split(cls),
        i, e;

    for (i = 0, e; !!(e = add[i]); i++) {
      if (current.indexOf(e) === -1) {
        current.push(e);
      }
    }

    setClasses(this, current);

    return this;
  };

  /**
   * @method snapsvg.Element#hasClass
   *
   * @param  {String}  cls the class to query for
   * @return {Boolean} returns true if the element has the given class
   */
  Element.prototype.hasClass = function(cls) {
    if (!cls) {
      throw new Error('[snapsvg] syntax: hasClass(clsStr)');
    }

    return getClasses(this).indexOf(cls) !== -1;
  };

  /**
   * @method snapsvg.Element#removeClass
   *
   * @example
   *
   * e.attr('class', 'foo bar');
   *
   * e.removeClass('foo');
   * e.attr('class'); // -> 'bar'
   *
   * e.removeClass('foo bar'); // removes classes foo and bar
   * e.attr('class'); // -> ''
   *
   * @param {String} cls classes to be removed from element
   *
   * @return {snapsvg.Element} the element (this)
   */
  Element.prototype.removeClass = function(cls) {
    var current = getClasses(this),
        remove = split(cls),
        i, e, idx;

    for (i = 0, e; !!(e = remove[i]); i++) {
      idx = current.indexOf(e);

      if (idx !== -1) {
        // remove element from array
        current.splice(idx, 1);
      }
    }

    setClasses(this, current);

    return this;
  };

});

/**
 * @class TranslatePlugin
 *
 * Extends snapsvg with methods to translate elements
 */
snapsvg.plugin(function (Snap, Element, Paper, global) {

  /*
   * @method snapsvg.Element#translate
   *
   * @example
   *
   * e.translate(10, 20);
   *
   * // sets transform matrix to translate(10, 20)
   *
   * @param {Number} x translation
   * @param {Number} y translation
   *
   * @return {snapsvg.Element} the element (this)
   */
  Element.prototype.translate = function(x, y) {
    var matrix = new Snap.Matrix();
    matrix.translate(x, y);
    return this.transform(matrix);
  };
});


/**
 * @class CreatePlugin
 *
 * Create an svg element without attaching it to the dom
 */
snapsvg.plugin(function(Snap) {

  Snap.create = function(name, attrs) {
    return Snap._.wrap(Snap._.$(name, attrs));
  };
});


/**
 * @class CreatSnapAtPlugin
 *
 * Extends snap.svg with a method to create a SVG element
 * at a specific position in the DOM.
 */
snapsvg.plugin(function(Snap, Element, Paper, global) {

  /*
   * @method snapsvg.createSnapAt
   *
   * @example
   *
   * snapsvg.createSnapAt(parentNode, 200, 200);
   *
   * @param {Number} width of svg
   * @param {Number} height of svg
   * @param {Object} parentNode svg Element will be child of this
   *
   * @return {snapsvg.Element} the newly created wrapped SVG element instance
   */
  Snap.createSnapAt = function(width, height, parentNode) {

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    if (!parentNode) {
      parentNode = document.body;
    }
    parentNode.appendChild(svg);

    return new Snap(svg);
  };
});