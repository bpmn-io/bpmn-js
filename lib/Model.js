var _ = require('lodash');

var Model = require('moddle'),
    xml = require('moddle-xml');

var PACKAGES = {
  bpmn: require('../resources/bpmn/json/bpmn.json'),
  bpmndi: require('../resources/bpmn/json/bpmndi.json'),
  dc: require('../resources/bpmn/json/dc.json'),
  di: require('../resources/bpmn/json/di.json')
};

var INSTANCE = null;

function createModel() {
  return new Model(PACKAGES);
}

function instance() {
  if (!INSTANCE) {
    INSTANCE = createModel();
  }

  return INSTANCE;
}

function fromXML(xmlStr, typeName, options, callback) {

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var model = instance();

  var reader = new xml.Reader(model, options);
  var rootHandler = reader.handler(typeName);

  reader.fromXML(xmlStr, rootHandler, function(err, result) {
    callback(err, result, rootHandler.context);
  });
}

function toXML(element, options, callback) {

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  var writer = new xml.Writer(options);
  try {
    var result = writer.toXML(element);
    callback(null, result);
  } catch (e) {
    callback(e);
  }
}

module.exports.instance = instance;

module.exports.fromXML = fromXML;
module.exports.toXML = toXML;