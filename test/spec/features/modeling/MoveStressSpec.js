import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import LoggingCroppingConnectionDocking from './LoggingCroppingConnectionDocking';


describe.skip('modeling / MoveShape - connection cropping', function() {

  var diagramXML = require('./MoveStress.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      {
        connectionDocking: [ 'type', LoggingCroppingConnectionDocking ]
      }
    ]
  }));


  var count = 0;

  it('stress stress', inject(function(elementRegistry, modeling, graphicsFactory) {

    var task = elementRegistry.get('TASK');

    var connections = [].concat(task.incoming, task.outgoing);

    function reconnect(c) {

      /*
      if (Math.random() > 0.9) {
        console.log(
          graphicsFactory.getConnectionPath(c),
          graphicsFactory.getShapePath(c.source),
          graphicsFactory.getShapePath(c.target)
        );
      };
      */

      modeling[(
        c.target === task
          ? 'reconnectEnd'
          : 'reconnectStart'
      )](c, task, randomDocking());
    }

    function randomDocking() {

      return {
        x: task.x + Math.round(Math.random() * (task.width)),
        y: task.y + Math.round(Math.random() * (task.height))
      };
    }

    function tick() {
      setTimeout(function() {
        console.log('#%s rate=%s, no-intersections=%s', count, window.noIntersectCount / count, window.noIntersectCount);

        if (!window.__STOPTEST) {
          tick();
        }
      }, 2000);
    }


    function next() {

      setTimeout(function() {
        count++;

        modeling.moveElements([ task ], {
          x: Math.round(Math.random() * 10 - 5),
          y: Math.round(Math.random() * 10 - 5)
        });

        connections.forEach(function(c) {
          if (Math.random() < 0.1) {
            reconnect(c);
          }
        });

        if (window.noIntersect && window.noIntersect.length) {

          // reconnect all non-intersection connections
          window.noIntersect.forEach(function(entry) {
            reconnect(entry[0]);
          });

          window.noIntersect.length = 0;
        }

        if (!window.__STOPTEST) {
          next();
        }
      }, 1);
    }

    next();
    tick();
  }));

});