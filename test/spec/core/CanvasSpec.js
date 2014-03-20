
var Events = require('../../../src/core/Events');
var TestHelper = require('../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;

var createSpy = jasmine.createSpy;

describe('Canvas', function() {

  describe('add shape', function() {

    beforeEach(bootstrapDiagram());

    it('should fire <shape.added> event', inject(function(canvas, events) {

      // given
      var listener = createSpy('listener');
      events.on('shape.added', listener);

      // when
      canvas.addShape({
        id: 'a',
        children: [
          { id: 'a.0', children: [] },
          { id: 'a.1', children: [
            { id: 'a.1.0' },
            { id: 'a.1.1' }
          ]},
          { id: 'a.2', children: [
            { id: 'a.2.0' },
            { id: 'a.2.1', children: [
              { id: 'a.2.1.0' }
            ]}
          ]}
        ]
      });

      // then
      expect(listener).toHaveBeenCalled();
    }));

  });
});