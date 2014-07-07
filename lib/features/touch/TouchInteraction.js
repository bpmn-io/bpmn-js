'use strict';

var $ = require('jquery');
var _ = require('lodash');

function TouchInteraction(eventBus, canvas) {

  var context;

  var RANGE = { min: 0.2, max: 4 };
  var DOUBLE_TAP_THRESHOLD = 300; // ms

  function handleTouchStart(event) {

    var orgEvent = event.originalEvent ? event.originalEvent : event;

    _.forEach(orgEvent.changedTouches, function (touch) {
      context.start[touch.identifier] = touch;
    });

    if (orgEvent.touches.length === 1) {
      initMove(orgEvent);
    }

    if (orgEvent.touches.length === 2) {
      initScale(orgEvent);
    }

    //Stop all interaction for more than 2 touch sources
    if (orgEvent.touches.length > 2) {
      contextInit();
    }

    event.preventDefault();
  }

  function handleTouchMove(event) {
    var orgEvent = event.originalEvent;
    var cX = 0;
    var cY = 0;
    var mX = 0;
    var mY = 0;

    if (context.move && !context.scale) {

      _.forEach(orgEvent.changedTouches, function (touch) {
        if (touch.identifier === context.moveId) {
          cX = touch.clientX;
          cY = touch.clientY;
        }
      });

      if (!context.lasttouch.cX) {
        context.lasttouch.cX = cX;
      }

      if (!context.lasttouch.cY) {
        context.lasttouch.cY = cY;
      }

      mX = cX - context.lasttouch.cX;
      mY = cY - context.lasttouch.cY;

      canvas.scroll({
        dx: mX,
        dy: mY
      });

      context.lasttouch.cX = cX;
      context.lasttouch.cY = cY;
    }

    if (context.scale) {
      var dist = euclideanDistance(orgEvent.touches[0], orgEvent.touches[1]);
      var distRatio = dist / context.start.dist;

      zoom(distRatio * context.start.zoom, context.start.mid);
      context.lastDistance = dist;
    }

    // prevent select
    event.preventDefault();
  }

  function handleTouchEnd(event) {

    var orgEvent = event.originalEvent;

    if (orgEvent.touches.length < 1) {
      contextInit();
    }
    if (orgEvent.touches.length === 1) {
      initMove(orgEvent);
    }
    if (orgEvent.touches.length === 2) {
      initScale(orgEvent);
    }

    _.forEach(orgEvent.changedTouches, function (touch) {
      delete context[touch.identifier];
    });

    // prevent select
    event.preventDefault();
  }

  function init(element) {

    contextInit();

    //--- general handlers
    $(element).on('touchstart', handleTouchStart);
    $(element).on('touchmove', handleTouchMove);
    $(document).on('touchend', handleTouchEnd);


    //--- snap handler

    eventBus.on('shape.touchstart', function(event) {
      // ---
      // TODO must forwarded to touchstart???#
      handleTouchStart(event);
    });

    eventBus.on('shape.touchend', function(event) {

      if(event.touches.length !== 0) {
        return;
      }

      if((Date.now() - context.lastTap.time) < DOUBLE_TAP_THRESHOLD) {
        eventBus.fire('shape.dbltap', event);
      }

      context.lastTap.time = Date.now();
    });
  }

  function cap(scale) {
    return Math.max(RANGE.min, Math.min(RANGE.max, scale));
  }

  function zoom(pinchRatio, position) {
    canvas.zoom(cap(pinchRatio), position);
  }

  function euclideanDistance(touch1, touch2) {
    var dist =
      Math.sqrt(
          (touch1.clientX - touch2.clientX) *
          (touch1.clientX - touch2.clientX) +
          (touch1.clientY - touch2.clientY) *
          (touch1.clientY - touch2.clientY)
      );

    return dist;
  }

  function initMove(orgEvent) {
    context.move = true;
    context.moveId = orgEvent.touches[0].identifier;
    context.scale = false;
    if (!context.lasttouch) {
      context.lasttouch = {
        cX: undefined,
        cY: undefined,
        mX: 0,
        mY: 0
      };
    }
  }

  function initScale(orgEvent) {
    context.scale = true;
    context.start.dist = euclideanDistance(orgEvent.touches[0], orgEvent.touches[1]);
    context.lastDistance = context.start.dist;
    context.start.zoom = canvas.zoom();
    context.start.mid = {
      x: (orgEvent.touches[0].clientX + orgEvent.touches[1].clientX) / 2,
      y: (orgEvent.touches[0].clientY + orgEvent.touches[1].clientY) / 2
    };
  }

  function contextInit() {
    context = {
      start: {},
      lastTap: {}
    };
  }

  eventBus.on('canvas.init', function(e) {
    init(e.paper.node);
  });
}

TouchInteraction.$inject = [ 'eventBus', 'canvas', 'touchFix' ];

module.exports = TouchInteraction;