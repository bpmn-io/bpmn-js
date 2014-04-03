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

/**
 * Instantiates a BPMN model tree from a given xml string.
 * 
 * @param  {String}   xmlStr
 * @param  {String}   [typeName] name of the root element, defaults to 'bpmn:Definitions'
 * @param  {Object}   [options] to pass to the underlying reader
 * @param  {Function} callback the callback that is invoked with (err, result, parseContext)
 */
function fromXML(xmlStr, typeName, options, callback) {

  if (!_.isString(typeName)) {
    callback = options;
    options = typeName;
    typeName = 'bpmn:Definitions';
  }

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