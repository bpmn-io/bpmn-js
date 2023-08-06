import {
  asTRBL,
  getMid
} from 'diagram-js/lib/layout/LayoutUtil';

import { getDistancePointPoint } from 'diagram-js/lib/features/bendpoints/GeometricUtil';

import {
  is,
  isAny
} from '../../util/ModelUtil';

const AUTO_CONNECT_PADDING = 200;

const IGNORED_SOURCES = [
  'bpmn:Participant'
];

const IGNORED_TARGETS = [
  'bpmn:Participant'
];

export default function AutoConnect(elementDetection, modeling, rules) {
  this._elementDetection = elementDetection;
  this._modeling = modeling;
  this._rules = rules;
}

AutoConnect.prototype.canConnect = function(element) {
  if (isAny(element, IGNORED_SOURCES)) {
    return false;
  }

  const elementTrbl = asTRBL(element);

  const rects = [
    {
      top: elementTrbl.top - AUTO_CONNECT_PADDING,
      right: elementTrbl.right + AUTO_CONNECT_PADDING,
      bottom: elementTrbl.bottom + AUTO_CONNECT_PADDING,
      left: elementTrbl.right + 10
    },
    {
      top: elementTrbl.top - AUTO_CONNECT_PADDING,
      right: elementTrbl.right + AUTO_CONNECT_PADDING,
      bottom: elementTrbl.bottom + AUTO_CONNECT_PADDING,
      left: elementTrbl.left - 10
    }
  ];

  return rects.reduce((target, rect) => {
    return target || this._findTarget(element, rect);
  }, false);
};

AutoConnect.prototype._findTarget = function(element, rect) {
  const possibleTargets = this._elementDetection.detectAt(rect).filter(possibleTarget => {
    return possibleTarget !== element
      && !isConnection(possibleTarget)
      && !isLabel(possibleTarget)
      && !isAny(possibleTarget, IGNORED_TARGETS);
  });

  console.log('possible targets', possibleTargets);

  // find closest element to connect to
  return possibleTargets.reduce((target, possibleTarget) => {
    if (isConnected(element, possibleTarget)
      || hasMaxOutgoingConnections(element)
      || hasMaxIncomingConnections(possibleTarget)) {
      return target;
    }

    const canConnect = this.getConnectionType(element, possibleTarget);

    if (!canConnect) {
      return target;
    }

    const distance = getDistancePointPoint(getMid(element), getMid(possibleTarget));

    if (!target || distance < getDistancePointPoint(getMid(element), getMid(target))) {
      return possibleTarget;
    }

    return target;
  }, null);
};

AutoConnect.prototype.getConnectionType = function(source, target) {
  return this._rules.allowed('connection.create', {
    source,
    target
  });
};

AutoConnect.prototype.connect = function(element) {
  const target = this.canConnect(element);

  if (!target) {
    return;
  }

  this._modeling.connect(element, target);
};

AutoConnect.$inject = [
  'elementDetection',
  'modeling',
  'rules'
];

function isConnection(element) {
  return element.waypoints;
}

function isLabel(element) {
  return element.labelTarget;
}

function isConnected(source, target) {
  return source.incoming.some(connection => connection.source === target)
    || source.outgoing.some(connection => connection.target === target);
}

function hasMaxIncomingConnections(element) {
  return !is(element, 'bpmn:Gateway') && element.incoming.length;
}

function hasMaxOutgoingConnections(element) {
  return !is(element, 'bpmn:Gateway') && element.outgoing.length;
}