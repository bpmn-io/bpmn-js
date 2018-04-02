import {
  getBpmnJS
} from 'test/TestHelper';


export function connect(source, target, attrs) {

  var elementRegistry = getBpmnJS().get('elementRegistry'),
      modeling = getBpmnJS().get('modeling');

  var sourceElement = typeof source === 'string' ? elementRegistry.get(source) : source;
  var targetElement = typeof target === 'string' ? elementRegistry.get(target) : target;

  // assume
  expect(sourceElement).to.exist;
  expect(targetElement).to.exist;

  return modeling.connect(sourceElement, targetElement, attrs);
}


export function reconnectEnd(connection, target, docking) {

  var elementRegistry = getBpmnJS().get('elementRegistry'),
      modeling = getBpmnJS().get('modeling');

  var connectionElement = typeof connection === 'string' ? elementRegistry.get(connection) : connection;
  var targetElement = typeof target === 'string' ? elementRegistry.get(target) : target;

  // assume
  expect(connectionElement).to.exist;
  expect(targetElement).to.exist;

  return modeling.reconnectEnd(connectionElement, targetElement, docking);
}


export function element(id) {
  return getBpmnJS().get('elementRegistry').get(id);
}


export function move(shape, delta) {

  var elementRegistry = getBpmnJS().get('elementRegistry'),
      modeling = getBpmnJS().get('modeling');

  var shapeElement = typeof shape === 'string' ? elementRegistry.get(shape) : shape;

  // assume
  expect(shapeElement).to.exist;

  modeling.moveElements([shapeElement], delta);

  return shapeElement;
}

// debugging
export function inspect(element) {
  console.log(JSON.stringify(element));
}