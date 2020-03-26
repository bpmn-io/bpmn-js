import { isFunction } from 'min-dash';

export function promisifyIfNecessary(api) {

  return function() {

    var argLen = arguments.length;
    var hasCallback = argLen > 0 && isFunction(arguments[argLen - 1]);

    if (hasCallback) {
      console.warn(
        'Warning: passing callbacks to ' + api.name +
        ' API will be deprecated in the next major bpmn-js release.' +
        ' Consider switching to promises instead. See the API documentation.'
      );

      return api.apply(this, arguments);
    }

    if (!window.Promise) {
      throw new Error('Promises are not supported for this browser. Consider polyfilling Promises.');
    }

    return new Promise(function(resolve, reject) {

      var callback = generateCallbackFunction(resolve, reject);
      var newArguments = concatFunctionArguments(this.originalArguments, callback);

      api.apply(this.originalContext, newArguments);
    }.bind({ originalContext: this, originalArguments: arguments }));
  };
}

function generateCallbackFunction(resolve, reject) {

  return function() {
    var error = arguments[0];
    var payload = arguments[1];

    if (error) {
      reject({
        error: error,
        payload: payload
      });
    } else {
      resolve(payload);
    }
  };
}

function concatFunctionArguments(oldArguments, newArgument) {
  var newArguments = [];

  for (var i = 0; i < oldArguments.length; i ++) {
    newArguments.push(oldArguments[i]);
  }

  newArguments.push(newArgument);

  return newArguments;
}
