var Events = require('../../../src/core/Events');

var createSpy = jasmine.createSpy;

describe('Events', function() {

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

  it('should #stopPropagation', function() {
    
    // given
    var e = createEventEmitter();
    var listener1 = createSpy('listener1').andCallFake(function(event) {
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
});