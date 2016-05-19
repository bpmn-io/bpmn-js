'use strict';

var isArray = require('lodash/lang/isArray'),
    forEach = require('lodash/collection/forEach'),
    map = require('lodash/collection/map'),
    find = require('lodash/collection/find'),
    findIndex = require('lodash/array/findIndex'),
    sortBy = require('lodash/collection/sortBy'),
    reduce = require('lodash/collection/reduce');

var getBBox = require('../../util/Elements').getBBox;

var PositionUtil = require('../../util/PositionUtil');

var CopyPasteUtil = require('../../util/CopyPasteUtil'),
    ElementsUtil = require('../../util/Elements');



function CopyPaste(eventBus, modeling, elementFactory, rules, clipboard, canvas) {
  this._eventBus = eventBus;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._rules = rules;
  this._canvas = canvas;

  this._clipboard = clipboard;

  this._descriptors = [];


  // Element creation priorities:
  // - 1: Independent shapes
  // - 2: Attached shapes
  // - 3: Connections
  // - 4: labels
  this.registerDescriptor(function(element, descriptor) {
    // Base priority
    descriptor.priority = 1;

    descriptor.id = element.id;

    if (element.parent) {
      descriptor.parent = element.parent.id;
    }

    if (element.labelTarget) {
      // Labels priority
      descriptor.priority = 4;
      descriptor.labelTarget = element.labelTarget.id;
    }

    if (element.host) {
      // Attached shapes priority
      descriptor.priority = 2;
      descriptor.host = element.host.id;
    }

    if (element.x) {
      descriptor.x = element.x;
      descriptor.y = element.y;
    }

    if (element.width) {
      descriptor.width = element.width;
      descriptor.height = element.height;
    }

    if (element.waypoints) {
      // Connections priority
      descriptor.priority = 3;
      descriptor.waypoints = [];

      forEach(element.waypoints, function(waypoint) {
        var wp = {
          x: waypoint.x,
          y: waypoint.y
        };

        if (waypoint.original) {
          wp.original = {
            x: waypoint.original.x,
            y: waypoint.original.y
          };
        }

        descriptor.waypoints.push(wp);
      });
    }

    if (element.source && element.target) {
      descriptor.source = element.source.id;
      descriptor.target = element.target.id;
    }

    return descriptor;
  });
}

CopyPaste.$inject = [
  'eventBus',
  'modeling',
  'elementFactory',
  'rules',
  'clipboard',
  'canvas'
];

module.exports = CopyPaste;

/**
 * Copy a number of elements.
 *
 * @param {djs.model.Base} selectedElements
 *
 * @return {Object} the copied tree
 */
CopyPaste.prototype.copy = function(selectedElements) {
  var clipboard = this._clipboard,
      tree, bbox;

  if (!isArray(selectedElements)) {
    selectedElements = selectedElements ? [ selectedElements ] : [];
  }

  if (!selectedElements.length) {
    return;
  }

  tree = this.createTree(selectedElements);

  bbox = this._bbox = PositionUtil.center(getBBox(tree.allShapes));

  // not needed after computing the center position of the copied elements
  delete tree.allShapes;

  forEach(tree, function(elements) {

    forEach(elements, function(element) {
      var delta, labelTarget;

      // set label's relative position to their label target
      if (element.labelTarget) {
        labelTarget = find(elements, { id: element.labelTarget });

        // just grab the delta from the first waypoint
        if (labelTarget.waypoints) {
          delta = PositionUtil.delta(element, labelTarget.waypoints[0]);
        } else {
          delta = PositionUtil.delta(element, labelTarget);
        }

      } else
      if (element.priority === 3) {
        // connections have priority 3
        delta = [];

        forEach(element.waypoints, function(waypoint) {
          var waypointDelta = PositionUtil.delta(waypoint, bbox);

          delta.push(waypointDelta);
        }, this);
      } else {
        delta = PositionUtil.delta(element, bbox);
      }

      element.delta = delta;
    });
  });

  this._eventBus.fire('elements.copy', { context: { tree: tree } });

  // if tree is empty, means that nothing can be or is allowed to be copied
  if (Object.keys(tree).length === 0) {
    clipboard.clear();
  } else {
    clipboard.set(tree);
  }

  this._eventBus.fire('elements.copied', { context: { tree: tree } });

  return tree;
};


// Allow pasting under the cursor
CopyPaste.prototype.paste = function(context) {
  var clipboard = this._clipboard,
      modeling = this._modeling,
      eventBus = this._eventBus,
      rules = this._rules;

  var tree = clipboard.get(),
      topParent = context.element,
      position = context.point,
      newTree, canPaste;

  if (clipboard.isEmpty()) {
    return;
  }

  newTree = reduce(tree, function(pasteTree, elements, depthStr) {
    var depth = parseInt(depthStr, 10);

    if (isNaN(depth)) {
      return pasteTree;
    }

    pasteTree[depth] = elements;

    return pasteTree;
  }, {}, this);


  canPaste = rules.allowed('elements.paste', {
    tree: newTree,
    target: topParent
  });

  if (!canPaste) {
    eventBus.fire('elements.paste.rejected', {
      context: {
        tree: newTree,
        position: position,
        target: topParent
      }
    });

    return;
  }

  modeling.pasteElements(newTree, topParent, position);
};


CopyPaste.prototype._computeDelta = function(elements, element) {
  var bbox = this._bbox,
      delta = {};

  // set label's relative position to their label target
  if (element.labelTarget) {
    console.log(elements);
    return PositionUtil.delta(element, element.labelTarget);
  }

  // connections have prority 3
  if (element.priority === 3) {
    delta = [];

    forEach(element.waypoints, function(waypoint) {
      var waypointDelta = PositionUtil.delta(waypoint, bbox);

      delta.push(waypointDelta);
    }, this);
  } else {
    delta = PositionUtil.delta(element, bbox);
  }

  return delta;
};


/**
 * Checks if the element in question has a relations to other elements.
 * Possible dependants: connections, labels, attachers
 *
 * @param  {Array} elements
 * @param  {Object} element
 *
 * @return {Boolean}
 */
CopyPaste.prototype.hasRelations = function(elements, element) {
  var source, target, labelTarget;

  if (element.waypoints) {
    source = find(elements, { id: element.source.id });
    target = find(elements, { id: element.target.id });

    if (!source || !target) {
      return false;
    }
  }

  if (element.labelTarget) {
    labelTarget = find(elements, { id: element.labelTarget.id });

    if (!labelTarget) {
      return false;
    }
  }

  return true;
};


CopyPaste.prototype.registerDescriptor = function(descriptor) {
  if (typeof descriptor !== 'function') {
    throw new Error('the descriptor must be a function');
  }

  if (this._descriptors.indexOf(descriptor) !== -1) {
    throw new Error('this descriptor is already registered');
  }

  this._descriptors.push(descriptor);
};


CopyPaste.prototype._executeDescriptors = function(data) {
  if (!data.descriptor) {
    data.descriptor = {};
  }

  forEach(this._descriptors, function(descriptor) {
    data.descriptor = descriptor(data.element, data.descriptor);
  });

  return data;
};

/**
 * Creates a tree like structure from an arbitrary collection of elements
 *
 * @example
 * tree: {
 *	0: [
 *		{ id: 'shape_12da', priority: 1, ... },
 *		{ id: 'shape_01bj', priority: 1, ... },
 *		{ id: 'connection_79fa', source: 'shape_12da', target: 'shape_01bj', priority: 3, ... },
 *	],
 *	1: [ ... ]
 * };
 *
 * @param  {Array} elements
 * @return {Object}
 */
CopyPaste.prototype.createTree = function(elements) {
  var rules = this._rules;

  var tree = {},
      includedElements = [],
      _elements;

  var topLevel = CopyPasteUtil.getTopLevel(elements);

  tree.allShapes = [];

  function canCopy(collection, element) {
    return rules.allowed('element.copy', {
      collection: collection,
      element: element
    });
  }

  function includeElement(data) {
    var idx = findIndex(includedElements, { element: data.element }),
        element;

    if (idx !== -1) {
      element = includedElements[idx];
    } else {
      return includedElements.push(data);
    }

    // makes sure that it has the correct depth
    if (element.depth < data.depth) {
      includedElements.splice(idx, 1);

      includedElements.push(data);
    }
  }


  ElementsUtil.eachElement(topLevel, function(element, i, depth) {
    var nestedChildren = element.children;

    // don't add labels directly
    if (element.labelTarget) {
      return;
    }

    function getNested(lists) {
      forEach(lists, function(list) {
        if (list && list.length) {

          forEach(list, function(elem) {
            // fetch element's label
            if (elem.label) {
              includeElement({
                element: elem.label,
                depth: depth
              });
            }

            includeElement({
              element: elem,
              depth: depth
            });
          });
        }
      });
    }

    // fetch element's label
    if (element.label) {
      includeElement({
        element: element.label,
        depth: depth
      });
    }

    getNested([ element.attachers, element.incoming, element.outgoing ]);

    includeElement({
      element: element,
      depth: depth
    });

    if (nestedChildren) {
      return nestedChildren;
    }
  });

  includedElements = map(includedElements, function(data) {
    // this is where other registered descriptors hook in
    return this._executeDescriptors(data);
  }, this);

  // order the elements to check if the ones dependant on others (by relationship)
  // can be copied. f.ex: label needs it's label target
  includedElements = sortBy(includedElements, function(data) {
    return data.descriptor.priority;
  });

  _elements = map(includedElements, function(data) {
    return data.element;
  });

  forEach(includedElements, function(data) {
    var depth = data.depth;

    if (!this.hasRelations(tree.allShapes, data.element)) {
      return;
    }

    if (!canCopy(_elements, data.element)) {
      return;
    }

    tree.allShapes.push(data.element);

    // create depth branches
    if (!tree[depth]) {
      tree[depth] = [];
    }

    tree[depth].push(data.descriptor);
  }, this);

  return tree;
};
