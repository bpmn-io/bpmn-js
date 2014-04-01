var Events = require('../../../src/core/Events');

var createSpy = jasmine.createSpy;

describe('Events', function() {
  'use strict';

  function createEventEmitter() {
    return new Events();
  }

  it('should fire listener', function() {
    
    // given
    var e = createEventEmitter();
    var listener = createSpy('listener');

    e.on('foo', listener);

    // when
    e.fire('foo', {});

    // then
    expect(listener).toHaveBeenCalled();
  });

  it('should fire typed listener', function() {
    
    // given
    var e = createEventEmitter();
    var listener = createSpy('listener');

    e.on('foo', listener);

    // when
    e.fire({ type: 'foo' });

    // then
    expect(listener).toHaveBeenCalled();
  });

  it('should stopPropagation', function() {
    
    // given
    var e = createEventEmitter();
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
    var e = createEventEmitter();
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
    var e = createEventEmitter();
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
    var e = createEventEmitter();
    var listener = createSpy('listener');

    // when
    e.on('foo', listener);
    e.fire('foo');

    expect(listener).toHaveBeenCalled();
  });

  it('once should only fire once', function() {

    // given
    var e = createEventEmitter();
    var listener = createSpy('listener');

    // when
    e.once('onceEvent', listener);
    e.fire('onceEvent', {value: 'a'});
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
});

describe('Events(priority) ', function() {
  'use strict';

  var e,
      listener1,
      listener2,
      listener3,
      listenerStopPropagation;

  function createEventEmitter() {
    return new Events();
  }

  beforeEach(function() {
    e = createEventEmitter();

    listener1 = function(param) {
      if(param.value === 'C') {
        param.value = 'Target State';
      } else {
        param.value = '';
      }
    };
    listener2 = function(param) {
      if(param.value === 'A') {
        param.value = 'B';
      } else {
        param.value = '';
      }
    };
    listener3 = function(param) {
      if(param.value === 'B') {
        param.value = 'C';
      } else {
        param.value = '';
      }
    };
    listenerStopPropagation = function(param) {
      if(param.value === 'B') {
        param.value = 'C';
        param.propagationStopped = true;
      } else {
        param.value = '';
      }
    };
  });

  it('higher priority should fire first', function() {

    // setup
    e.on('foo', listener1, 100);
    e.on('foo', listener2, 500);
    e.on('foo', listener3, 200);

    // event fired with example data
    // to control the order of execution
    var param = {value: 'A'};
    e.fire('foo', param);

    expect(param.value).toEqual('Target State');
  });

  it('higher priority should fire first and make sure' +
    'registration order does not affect anything', function() {

    // setup
    e.on('foo', listener3, 200);
    e.on('foo', listener1, 100);
    e.on('foo', listener2, 500);

    // event fired with example data
    // to control the order of execution
    var param = {value: 'A'};
    e.fire('foo', param);

    expect(param.value).toEqual('Target State');
  });

  it('event with same priority should fire in registration order', function() {
    // setup
    e.on('foo', listener3, 100);
    e.on('foo', listener2, 100);
    e.on('foo', listener1, 100);

    // event fired with example data
    // to control the order of execution
    var param = {value: 'A'};
    e.fire('foo', param);
  });

  it(' user should be able to stop propagation' +
        ' to handler with lower priority.', function() {

    // setup
    e.on('foo', listenerStopPropagation, 200);
    e.on('foo', listener1, 100);
    e.on('foo', listener2, 500);

    // event fired with example data
    // to control the order of execution
    var param = {value: 'A'};
    e.fire('foo', param);

    // After second listener propagation should be stopped
    // listener1 should not be fired.
    expect(param.value).toEqual('C');
  });

  it('should set default priority when not set', function() {

    // setup
    e.on('foo', listener3); //Should use default of 1000
    e.on('foo', listener1, 500);
    e.on('foo', listener2, 5000);

    // event fired with example data
    // to control the order of execution
    var param = {value: 'A'};
    e.fire('foo', param);

    // After second listener propagation should be stopped
    // listener1 should not be fired.
    expect(param.value).toEqual('Target State');
  });
});