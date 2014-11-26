var EventBus = require('../../../lib/core/EventBus');

var createSpy = jasmine.createSpy;


describe('core/EventBus', function() {

  var eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  describe('basic behavior', function() {

    it('should fire listener', function() {

      // given
      var listener = createSpy('listener');

      eventBus.on('foo', listener);

      // when
      eventBus.fire('foo', {});

      // then
      expect(listener).toHaveBeenCalled();
    });


    it('should fire typed listener', function() {

      // given
      var listener = createSpy('listener');

      eventBus.on('foo', listener);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener).toHaveBeenCalled();
    });


    it('should stopPropagation', function() {

      // given
      var listener1 = createSpy('listener1').and.callFake(function(event) {
        event.stopPropagation();
      });

      var listener2 = createSpy('listener2');

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });


    describe('default action', function() {

      it('should allow if no listeners', function() {

        // when
        var defaultPrevented = !eventBus.fire('foo');

        // then
        expect(defaultPrevented).toBe(false);
      });


      it('should allow with listeners', function() {

        // given
        eventBus.on('foo', function(event) { });

        // when
        var defaultPrevented = !eventBus.fire('foo');

        // then
        expect(defaultPrevented).toBe(false);
      });


      it('should prevent on Event#preventDefault', function() {

        // given
        eventBus.on('foo', function(event) {
          event.preventDefault();
        });

        // when
        var defaultPrevented = !eventBus.fire('foo');

        // then
        expect(defaultPrevented).toBe(true);
      });


      it('should prevent on listener returning false', function() {

        // given
        eventBus.on('foo', function(event) {
          return false;
        });

        // when
        var defaultPrevented = !eventBus.fire('foo');

        // then
        expect(defaultPrevented).toBe(true);
      });


      it('should not stop propagation to other listeners', function() {

        // given
        var listener1 = createSpy('listener1').and.callFake(function(event) {
          return false;
        });

        var listener2 = createSpy('listener2');

        eventBus.on('foo', listener1);
        eventBus.on('foo', listener2);

        // when
        var defaultPrevented = !eventBus.fire('foo');

        // then
        expect(defaultPrevented).toBe(true);

        expect(listener1).toHaveBeenCalled();
        expect(listener2).toHaveBeenCalled();
      });

    });


    it('should remove listeners by event type', function() {

      // given
      var listener1 = createSpy('listener1');
      var listener2 = createSpy('listener2');

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo');
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });


    it('should remove listener by callback', function() {

      // given
      var listener1 = createSpy('listener1');
      var listener2 = createSpy('listener2');

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo', listener1);
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });


    it('should fire event by name', function() {

      // given
      var listener = createSpy('listener');

      // when
      eventBus.on('foo', listener);
      eventBus.fire('foo');

      expect(listener).toHaveBeenCalled();
    });


    it('once should only fire once', function() {

      // given
      var listener = createSpy('listener');

      // when
      eventBus.once('onceEvent', listener);
      eventBus.fire('onceEvent', { value: 'a' });
      expect(listener).toHaveBeenCalled();

      // Should not be fired
      listener.calls.reset(); // Reset the count
      eventBus.fire('onceEvent');
      expect(listener).not.toHaveBeenCalled();

      // register again a listener
      eventBus.once('onceEvent', listener);
      eventBus.fire('onceEvent');

      // should be fired again
      expect(listener).toHaveBeenCalled();
    });


    it('should register to multiple events', function() {

      // given
      var listener1 = createSpy('listener1');

      eventBus.on([ 'foo', 'bar' ], listener1);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).toHaveBeenCalled();
    });

  });


  describe('error handling', function() {

    it('should propagate error via <error> event', function() {

      // given
      var errorListener = createSpy('error-listener');
      var failingListener = function() {
        throw new Error('fail');
      };

      // when
      eventBus.on('error', errorListener);
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).toThrowError('fail');

      expect(errorListener).toHaveBeenCalled();
    });


    it('should handle error in <error> event listener', function() {

      // given
      function errorListener(e) {
        e.preventDefault();
      }

      function failingListener() {
        throw new Error('fail');
      }

      // when
      eventBus.on('error', errorListener);
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).not.toThrow();
    });


    it('should throw error without <error> event listener', function() {

      // given
      function failingListener() {
        throw new Error('fail');
      }

      // when
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).toThrow();
    });

  });


  describe('event priorities', function() {

    var listener1,
        listener2,
        listener3,
        listenerStopPropagation;


    beforeEach(function() {

      listener1 = function(e) {
        if (e.data.value === 'C') {
          e.data.value = 'Target State';
        } else {
          e.data.value = '';
        }
      };

      listener2 = function(e) {
        if (e.data.value === 'A') {
          e.data.value = 'B';
        } else {
          e.data.value = '';
        }
      };

      listener3 = function(e) {
        if (e.data.value === 'B') {
          e.data.value = 'C';
        } else {
          e.data.value = '';
        }
      };

      listenerStopPropagation = function(e) {
        if (e.data.value === 'B') {
          e.data.value = 'C';
          e.stopPropagation();
        } else {
          e.data.value = '';
        }
      };

    });


    it('should fire highes priority first', function() {

      // setup
      eventBus.on('foo', 100, listener1);
      eventBus.on('foo', 500, listener2);
      eventBus.on('foo', 200, listener3);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      expect(param.data.value).toEqual('Target State');
    });


    it('should fire highest first (independent from registration order)', function() {

      // setup
      eventBus.on('foo', 200, listener3);
      eventBus.on('foo', 100, listener1);
      eventBus.on('foo', 500, listener2);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      expect(param.data.value).toEqual('Target State');
    });


    it('should fire same priority in registration order', function() {

      // setup
      eventBus.on('foo', 100, listener3);
      eventBus.on('foo', 100, listener2);
      eventBus.on('foo', 100, listener1);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);
    });


    it('should stop propagation to lower priority handlers', function() {

      // setup
      eventBus.on('foo', 200, listenerStopPropagation);
      eventBus.on('foo', 100, listener1);
      eventBus.on('foo', 500, listener2);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      // After second listener propagation should be stopped
      // listener1 should not be fired.
      expect(param.data.value).toEqual('C');
    });


    it('should default to 1000 if non is specified', function() {

      // setup
      eventBus.on('foo', listener3); // should use default of 1000
      eventBus.on('foo', 500, listener1);
      eventBus.on('foo', 5000, listener2);

      // event fired with example data
      // to control the order of execution
      var param = { data: { value: 'A' } };
      eventBus.fire('foo', param);

      // After second listener propagation should be stopped
      // listener1 should not be fired.
      expect(param.data.value).toEqual('Target State');
    });

  });
});