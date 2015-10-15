'use strict';


var inherits = require('inherits');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var is = require('../../../util/ModelUtil').is;

var getLanesRoot = require('../util/LaneUtil').getLanesRoot;

var eachElement = require('diagram-js/lib/util/Elements').eachElement;


var LOW_PRIORITY = 500;


/**
 * BPMN specific delete lane behavior
 */
function UpdateLaneRefsBehavior(eventBus) {

  CommandInterceptor.call(this, eventBus);

  /**
   * Ok, this is it:
   *
   * We cannot simply update the lane refs for every flow node move
   */
  var context;

  function schedule(type, elements) {

    context = context || {
      flowNodes: {},
      participants: {},
      skipParticipants: {},
      counter: 0
    };

    if (type === 'updateflowNodes') {
      elements.forEach(function(e) {
        if (!e.labelTarget) {
          context.flowNodes[e.id] = e;
        }
      });
    } else
    if (type === 'updateLanes') {
      elements.forEach(function(e) {
        var root = is(e, 'bpmn:Participant') ? e : getLanesRoot(e);

        if (root) {
          context.participants[root.id] = root;
        }
      });
    } else
    if (type === 'skipParticipants') {
      elements.forEach(function(e) {
        context.skipParticipants[e.id] = e;
      });
    }

    context.counter++;
  }

  function release() {

    if (!context) {
      throw new Error('out of band release; :-(');
    }

    context.counter--;

    if (!context.counter) {
      console.log('updating flowNodeRefs');

      console.log(context);

      console.log();

      context = null;
    }
  }

  // use general space tool as grouping

  this.preExecute([ 'spaceTool' ], function(event) {
    schedule('resizeMaybe');
  });

  this.postExecuted([ 'spaceTool' ], function(event) {
    release();
  });


  /**
   * Mark flow nodes
   */
  this.preExecute([
    'lane.add',
    'lane.resize',
    'lane.split',
    'shape.delete',
    'shape.resize'
  ], function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:Lane') || is(shape, 'bpmn:Participant')) {
      schedule('updateLanes', [ shape ]);

      context.updateLanes = true;
    }
  });

  this.postExecuted([
    'lane.add',
    'lane.resize',
    'lane.split',
    'shape.delete',
    'shape.resize'
  ], LOW_PRIORITY, function(event) {

    var context = event.context;

    if (context.updateLanes) {
      release();
    }
  });


  this.preExecute([
    'elements.move'
  ], function(event) {

    var context = event.context,
        shapes = context.shapes;

    var participantShapes = shapes.filter(function(s) {
      return is(s, 'bpmn:Participant');
    });

    if (participantShapes.length) {
      schedule('skipParticipants', participantShapes);

      context.skipParticipants = true;
    }

    var flowNodeShapes = shapes.filter(function(s) {
      return is(s, 'bpmn:FlowNode') && is(s.parent, 'bpmn:Participant');
    });

    if (flowNodeShapes.length) {
      schedule('updateFlowNodes', flowNodeShapes);

      context.updateFlowNodes = true;
    }
  });

  this.postExecuted([
    'elements.move'
  ], LOW_PRIORITY, function(event) {

    var context = event.context;

    if (context.updateFlowNodes) {
      release();
    }

    if (context.skipParticipants) {
      release();
    }
  });


  this.preExecute([
    'shape.create',
    'shape.delete',
    'shape.move'
  ], function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:FlowNode')) {
      schedule('updateFlowNodes', [ shape ]);

      context.updateFlowNodes = true;
    }
  });


  this.postExecuted([
    'shape.create',
    'shape.delete',
    'shape.move'
  ], LOW_PRIORITY, function(event) {

    var context = event.context;

    if (context.updateFlowNodes) {
      release();
    }
  });
}

UpdateLaneRefsBehavior.$inject = [ 'eventBus', 'modeling' ];

inherits(UpdateLaneRefsBehavior, CommandInterceptor);

module.exports = UpdateLaneRefsBehavior;