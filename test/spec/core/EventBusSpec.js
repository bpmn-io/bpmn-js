'use strict';

var EventBus = require('../../../lib/core/EventBus');

var createSpy = jasmine.createSpy;


describe('core/EventBus', function() {

  it('should fire listener', function() {

    // given
    var e = new EventBus();
    var listener = createSpy('listener');

    e.on('foo', listener);

    // when
    e.fire('foo', {});

    // then
    expect(listener).toHaveBeenCalled();
  });


  it('should fire typed listener', function() {

    // given
    var e = new EventBus();
    var listener = createSpy('listener');

    e.on('foo', listener);

    // when
    e.fire({ type: 'foo' });

    // then
    expect(listener).toHaveBeenCalled();
  });


  it('should stopPropagation', function() {

    // given
    var e = new EventBus();
    var listener1 = createSpy('listener1').and.callFake(function(event) {
      event.stopPropagation();
    });

    var listener2 = createSpy('listener2');

    e.on('foo', listener1);
    e.on('foo', listener2);

    // when
    e.fire({ type: 'foo' });

    // then
    expect(listener1).toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });


  it('should remove listeners by event type', function() {

    // given
    var e = new EventBus();
    var listener1 = createSpy('listener1');
    var listener2 = createSpy('listener2');

    e.on('foo', listener1);
    e.on('foo', listener2);

    // when
    e.off('foo');
    e.fire({ type: 'foo' });

    // then
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });


  it('should remove listener by callback', function() {

    // given
    var e = new EventBus();
    var listener1 = createSpy('listener1');
    var listener2 = createSpy('listener2');

    e.on('foo', listener1);
    e.on('foo', listener2);

    // when
    e.off('foo', listener1);
    e.fire({ type: 'foo' });

    // then
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });


  it('should fire event by name', function() {

    // given
    var e = new EventBus();
    var listener = createSpy('listener');

    // when
    e.on('foo', listener);
    e.fire('foo');

    expect(listener).toHaveBeenCalled();
  });


  it('once should only fire once', function() {

    // given
    var e = new EventBus();
    var listener = createSpy('listener');

    // when
    e.once('onceEvent', listener);
    e.fire('onceEvent', { value: 'a' });
    expect(listener).toHaveBeenCalled();

    // Should not be fired
    listener.calls.reset(); // Reset the count
    e.fire('onceEvent');
    expect(listener).not.toHaveBeenCalled();

    // register again a listener
    e.once('onceEvent', listener);
    e.fire('onceEvent');

    // should be fired again
    expect(listener).toHaveBeenCalled();
  });


  it('should register to multiple events', function() {

    // given
    var e = new EventBus();
    var listener1 = createSpy('listener1');

    e.on([ 'foo', 'bar' ], listener1);

    // when
    e.fire({ type: 'foo' });

    // then
    expect(listener1).toHaveBeenCalled();
  });

});


describe('error handling', function() {

  it('should propagate error via <error> event', function() {

    // given
    var e = new EventBus();

    var errorListener = createSpy('error-listener');
    var failingListener = function() {
      throw new Error('fail');
    };

    // when
    e.on('error', errorListener);
    e.on('fail', failingListener);

    // then
    expect(function() {
      e.fire({ type: 'fail' });
    }).toThrowError('fail');

    expect(errorListener).toHaveBeenCalled();
  });


  it('should handle error in <error> event listener', function() {

    // given
    var e = new EventBus();

    var errorListener = function(e) {
      e.preventDefault();
    };

    var failingListener = function() {
      throw new Error('fail');
    };

    // when
    e.on('error', errorListener);
    e.on('fail', failingListener);

    // then
    expect(function() {
      e.fire({ type: 'fail' });
    }).not.toThrow();
  });


  it('should throw error without <error> event listener', function() {

    // given
    var e = new EventBus();

    var failingListener = function() {
      throw new Error('fail');
    };

    // when
    e.on('fail', failingListener);

    // then
    expect(function() {
      e.fire({ type: 'fail' });
    }).toThrow();
  });

});


describe('event priorities', function() {

  var e,
      listener1,
      listener2,
      listener3,
      listenerStopPropagation;


  beforeEach(function() {
    e = new EventBus();

    listener1 = function(param) {
      if (param.value === 'C') {
        param.value = 'Target State';
      } else {
        param.value = '';
      }
    };
    listener2 = function(param) {
      if (param.value === 'A') {
        param.value = 'B';
      } else {
        param.value = '';
      }
    };
    listener3 = function(param) {
      if (param.value === 'B') {
        param.value = 'C';
      } else {
        param.value = '';
      }
    };
    listenerStopPropagation = function(param) {
      if (param.value === 'B') {
        param.value = 'C';
        param.propagationStopped = true;
      } else {
        param.value = '';
      }
    };
  });


  it('should fire highes priority first', function() {

    // setup
    e.on('foo', 100, listener1);
    e.on('foo', 500, listener2);
    e.on('foo', 200, listener3);

    // event fired with example data
    // to control the order of execution
    var param = { value: 'A' };
    e.fire('foo', param);

    expect(param.value).toEqual('Target State');
  });


  it('should fire highest first (independent from registration order)', function() {

    // setup
    e.on('foo', 200, listener3);
    e.on('foo', 100, listener1);
    e.on('foo', 500, listener2);

    // event fired with example data
    // to control the order of execution
    var param = { value: 'A' };
    e.fire('foo', param);

    expect(param.value).toEqual('Target State');
  });


  it('should fire same priority in registration order', function() {
    // setup
    e.on('foo', 100, listener3);
    e.on('foo', 100, listener2);
    e.on('foo', 100, listener1);

    // event fired with example data
    // to control the order of execution
    var param = { value: 'A' };
    e.fire('foo', param);
  });


  it('should stop propagation to lower priority handlers', function() {

    // setup
    e.on('foo', 200, listenerStopPropagation);
    e.on('foo', 100, listener1);
    e.on('foo', 500, listener2);

    // event fired with example data
    // to control the order of execution
    var param = { value: 'A' };
    e.fire('foo', param);

    // After second listener propagation should be stopped
    // listener1 should not be fired.
    expect(param.value).toEqual('C');
  });


  it('should default to 1000 if non is specified', function() {

    // setup
    e.on('foo', listener3); // should use default of 1000
    e.on('foo', 500, listener1);
    e.on('foo', 5000, listener2);

    // event fired with example data
    // to control the order of execution
    var param = { value: 'A' };
    e.fire('foo', param);

    // After second listener propagation should be stopped
    // listener1 should not be fired.
    expect(param.value).toEqual('Target State');
  });

});