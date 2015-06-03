'use strict';

var EventBus = require('../../../lib/core/EventBus');


/* global sinon */

describe('core/EventBus', function() {

  var eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  describe('basic behavior', function() {

    it('should fire listener', function() {

      // given
      var listener = sinon.spy();//createSpy('listener');

      eventBus.on('foo', listener);

      // when
      eventBus.fire('foo', {});

      // then
      expect(listener).to.have.been.called;
    });


    it('should fire typed listener', function() {

      // given
      var listener = sinon.spy();

      eventBus.on('foo', listener);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener).to.have.been.called;
    });


    it('should stopPropagation', function() {

      // given
      var listener1 = sinon.spy(function(event){
        event.stopPropagation();
      });

      var listener2 = sinon.spy();

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).to.have.been.called;
      expect(listener2).to.not.have.been.called;
    });


    describe('return value', function() {

      it('should be undefined if no listeners', function() {

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.be.undefined;
      });


      it('should be true with non-acting listener', function() {

        // given
        eventBus.on('foo', function(event) { });

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.be.undefined;
      });


      it('should be false with listener preventing event default', function() {

        // given
        eventBus.on('foo', function(event) {
          event.preventDefault();
        });

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.be.false;
      });


      it('should be undefined with listener stopping propagation', function() {

        // given
        eventBus.on('foo', function(event) {
          event.stopPropagation();
        });

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.be.undefined;
      });

    });


    describe('returning custom value in listener', function() {

      it('should pass through', function() {

        // given
        var result = {};

        eventBus.on('foo', function(event) {
          return result;
        });

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.equal(result);
      });


      it('should stop propagation', function() {

        // given
        var result = {},
            otherResult = {};

        eventBus.on('foo', function(event) {
          return result;
        });

        eventBus.on('foo', function(event) {
          return otherResult;
        });

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.equal(result);
      });

    });


    describe('returning false in listener', function() {

      it('should set return value to false', function() {

        // given
        eventBus.on('foo', function(event) {
          return false;
        });

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.be.false;
      });


      it('should stop propagation to other listeners', function() {

        // given
        var listener1 = sinon.spy(function(event){
          return false;
        });

        var listener2 = sinon.spy();

        eventBus.on('foo', listener1);
        eventBus.on('foo', listener2);

        // when
        var returnValue = eventBus.fire('foo');

        // then
        expect(returnValue).to.be.false;

        expect(listener1).to.have.been.called;
        expect(listener2).to.not.have.been.called;
      });

    });


    describe('custom arguments', function() {

      it('should pass arguments', function() {

        var listenerArgs;

        function captureArgs() {
          listenerArgs = arguments;
        }

        eventBus.on('capture', captureArgs);

        // when
        eventBus.fire('capture', 1, 2, 3);

        // then
        expect(listenerArgs.length).to.eql(4);
        expect(listenerArgs[1]).to.eql(1);
        expect(listenerArgs[2]).to.eql(2);
        expect(listenerArgs[3]).to.eql(3);
      });

    });


    it('should remove listeners by event type', function() {

      // given
      var listener1 = sinon.spy();
      var listener2 = sinon.spy();

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo');
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).to.not.have.been.called
      expect(listener2).to.not.have.been.called;
    });


    it('should remove listener by callback', function() {

      // given
      var listener1 = sinon.spy();
      var listener2 = sinon.spy();

      eventBus.on('foo', listener1);
      eventBus.on('foo', listener2);

      // when
      eventBus.off('foo', listener1);
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).to.not.have.been.called;
      expect(listener2).to.have.been.called;
    });


    it('should fire event by name', function() {

      // given
      var listener = sinon.spy();

      // when
      eventBus.on('foo', listener);
      eventBus.fire('foo');

      expect(listener).to.have.been.called;
    });


    it('once should only fire once', function() {

      // given
      var listener = sinon.spy();

      // when
      eventBus.once('onceEvent', listener);
      eventBus.fire('onceEvent', { value: 'a' });
      expect(listener).to.have.been.called;

      // Should not be fired
      listener.reset(); // Reset the count
      eventBus.fire('onceEvent');
      expect(listener).to.not.have.been.called;

      // register again a listener
      eventBus.once('onceEvent', listener);
      eventBus.fire('onceEvent');

      // should be fired again
      expect(listener).to.have.been.called;
    });


    it('should register to multiple events', function() {

      // given
      var listener1 = sinon.spy();

      eventBus.on([ 'foo', 'bar' ], listener1);

      // when
      eventBus.fire({ type: 'foo' });

      // then
      expect(listener1).to.have.been.called;
    });

  });


  describe('error handling', function() {

    it('should propagate error via <error> event', function() {

      // given
      var errorListener = sinon.spy();
      var failingListener = function() {
        throw new Error('expected failure');
      };

      // when
      eventBus.on('error', errorListener);
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).to.throw('expected failure');

      expect(errorListener).to.have.been.called;
    });


    it('should handle error in <error> event listener', function() {

      // given
      function errorListener(e) {
        e.preventDefault();
      }

      function failingListener() {
        throw new Error('expected failure');
      }

      // when
      eventBus.on('error', errorListener);
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).to.not.throw();
    });


    it('should throw error without <error> event listener', function() {

      // given
      function failingListener() {
        throw new Error('expected failure');
      }

      // when
      eventBus.on('fail', failingListener);

      // then
      expect(function() {
        eventBus.fire({ type: 'fail' });
      }).to.throw('expected failure');
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

      expect(param.data.value).to.equal('Target State');
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

      expect(param.data.value).to.equal('Target State');
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
      expect(param.data.value).to.equal('C');
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
      expect(param.data.value).to.equal('Target State');
    });

  });

});
