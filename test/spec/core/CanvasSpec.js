var Canvas = require('../../../src/core/Canvas');
var Events = require('../../../src/core/Events');
var CommandStack = require('../../../src/features/services/CommandStack');
var SvgFactory = require('../../../src/core/SvgFactory');

var createSpy = jasmine.createSpy;

describe('test if event is thrown if', function() {

  it('canvas.addShape is called', function() {
    var e = new Events();
    var commandStack = new CommandStack();
    var svgFactory = new SvgFactory(e);
    var canvas = new Canvas({canvas: {width:20, height:20, container: undefined}}, e, commandStack, svgFactory);
    var listener = createSpy('listener');

    e.on('shape.added', listener);

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
  });
});