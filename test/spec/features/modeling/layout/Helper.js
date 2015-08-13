var TestHelper = require('../../../../TestHelper');


function connect(source, target, attrs) {

  var elementRegistry = TestHelper.getBpmnJS().get('elementRegistry'),
      modeling = TestHelper.getBpmnJS().get('modeling');

  var sourceElement = typeof source === 'string' ? elementRegistry.get(source) : source;
  var targetElement = typeof target === 'string' ? elementRegistry.get(target) : target;

  // assume
  expect(sourceElement).to.exist;
  expect(targetElement).to.exist;

  return modeling.connect(sourceElement, targetElement, attrs);
}


function reconnectEnd(connection, target, docking) {

  var elementRegistry = TestHelper.getBpmnJS().get('elementRegistry'),
      modeling = TestHelper.getBpmnJS().get('modeling');

  var connectionElement = typeof connection === 'string' ? elementRegistry.get(connection) : connection;
  var targetElement = typeof target === 'string' ? elementRegistry.get(target) : target;

  // assume
  expect(connectionElement).to.exist;
  expect(targetElement).to.exist;

  return modeling.reconnectEnd(connectionElement, targetElement, docking);
}

function element(id) {
  return TestHelper.getBpmnJS().get('elementRegistry').get(id);
}

function move(shape, delta) {

  var elementRegistry = TestHelper.getBpmnJS().get('elementRegistry'),
      modeling = TestHelper.getBpmnJS().get('modeling');

  var shapeElement = typeof shape === 'string' ? elementRegistry.get(shape) : shape;

  // assume
  expect(shapeElement).to.exist;

  modeling.moveElements([shapeElement], delta);

  return shapeElement;
}


// API

module.exports.connect = connect;
module.exports.reconnectEnd = reconnectEnd;
module.exports.element = element;
module.exports.move = move;

// debugging
module.exports.inspect = function(element) {
  console.log(JSON.stringify(element));
};