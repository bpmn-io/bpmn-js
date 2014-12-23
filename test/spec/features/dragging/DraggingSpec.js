var _ = require('lodash');

var TestHelper = require('../../../TestHelper'),
    Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */


var dragModule = require('../../../../lib/features/dragging');


describe('Dragging', function() {

  beforeEach(bootstrapDiagram({ modules: [ dragModule ] }));

  beforeEach(inject(function(canvas) {
    canvas.addShape({ id: 'shape', x: 10, y: 10, width: 50, height: 50 });
  }));


  describe('behavior', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var createEvent;

    beforeEach(inject(function(canvas) {

      var Event = Events.target(canvas._svg);

      createEvent = function(data) {

        var clientRect = canvas._container.getBoundingClientRect();
        data.x += clientRect.left;
        data.y += clientRect.top;

        return Event.create(data);
      };
    }));


    var recordEvents;

    beforeEach(inject(function(eventBus) {
      recordEvents = function(prefix) {
        var events = [];

        [ 'start', 'move', 'end', 'hover', 'out', 'cancel', 'cleanup', 'activate' ].forEach(function(type) {
          eventBus.on(prefix + '.' + type, function(e) {
            events.push(_.extend({}, e));
          });
        });

        return events;
      };
    }));


    function raw(e) {
      return _.omit(e, [ 'originalEvent' ]);
    }


    it('should cancel original event on activate', inject(function(dragging) {

      // given
      var event = createEvent({ x: 10, y: 10 });

      // when
      dragging.activate(event, 'foo');

      // then
      expect(event.defaultPrevented).toBe(true);
    }));


    it('should pass custom data', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.activate(createEvent({ x: 10, y: 10 }), 'foo', {
        data: { foo: 'BAR' }
      });

      // then
      expect(events.length).toBe(1);

      expect(events).toEqual([
        { foo: 'BAR', type: 'foo.activate' }
      ]);
    }));


    it('should fire life-cycle events', inject(function(dragging, canvas) {

      // given
      var events = recordEvents('foo');

      debugger;

      // when
      dragging.activate(createEvent({ x: 10, y: 10 }), 'foo');
      dragging.move(createEvent({ x: 30, y: 20 }));
      dragging.move(createEvent({ x: 5, y: 10 }));

      dragging.cancel();

      // then
      expect(events.map(raw)).toEqual([
        { type: 'foo.activate' },
        { x: 10, y: 10, dx: 0, dy: 0, type: 'foo.start' },
        { x: 30, y: 20, dx: 20, dy: 10, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cancel' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cleanup' }
      ]);
    }));


    it('should cancel running', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // a is active
      dragging.activate(createEvent({ x: 10, y: 10 }), 'foo', { data: { element: 'a' } });

      // when
      // activate b
      dragging.activate(createEvent({ x: 10, y: 10 }), 'foo', { data: { element: 'b' } });

      // then
      expect(events.map(raw)).toEqual([
        { element: 'a', type: 'foo.activate' },
        { element: 'a', type: 'foo.cleanup' },
        { element: 'b', type: 'foo.activate' }
      ]);

    }));

  });

});
