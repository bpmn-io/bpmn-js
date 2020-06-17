/**
 * Native Clipboard integration for copy and paste
 *
 * Caveats:
 *
 * * access to clipboard API:
 *     - avaliable as a working draft only
 *     - implemented in Chrome only
 *     - needs explicit user permission => does not work out of the box
 *     - only supports 'text/plain', thus f***ing with the users interaction
 *
 */

// TODO(nikku): support custom mime type
const MIME_TYPE = 'text/plain' || 'application/x-bpmn-js-clip';


/**
 * A native cliopboardclip board stub
 */
export default function NativeClipboard(moddle) {
  this._moddle = moddle;
}

NativeClipboard.$inject = [ 'moddle' ];

NativeClipboard.prototype.get = async function() {

  // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/read

  const allowed = await this._hasPermission('clipboard-read');

  if (!allowed) {
    return;
  }

  const items = await navigator.clipboard.read();

  for (const item of items) {

    if (item.types.includes(MIME_TYPE)) {

      const serializedData = await item.getType(MIME_TYPE);

      const textData = await serializedData.text();

      return this._reviveData(textData);
    }
  }

  return null;
};

NativeClipboard.prototype.set = async function(data) {

  // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write

  const allowed = await this._hasPermission('clipboard-write');

  if (!allowed) {
    return;
  }

  var json = JSON.stringify(data);

  var blob = new Blob([ json ], { type : MIME_TYPE });

  var dataTransfer = new DataTransfer();

  dataTransfer.items.add(json, MIME_TYPE);

  return navigator.clipboard.write([
    new ClipboardItem({
      [ MIME_TYPE ]: blob
    })
  ]);
};

NativeClipboard.prototype.clear = function() {
  throw new Error('not implemented');
};

NativeClipboard.prototype._reviveData = function(serializedData) {

  const reviver = createReviver(this._moddle);

  return JSON.parse(serializedData, reviver);
};

NativeClipboard.prototype._hasPermission = async function(name) {
  try {
    const result = await navigator.permissions.query({ name });

    if (result.state === 'granted' || result.state === 'prompt') {
      return true;
    }
  } catch (err) {
    return true;
  }

  return false;
};


// helpers /////////////

export function createReviver(moddle) {

  var elCache = {};

  /**
   * The actual reviewer that creates model instances
   * for elements with a $type attribute.
   *
   * Elements with ids will be re-used, if already
   * created.
   *
   * @param  {String} key
   * @param  {Object} object
   *
   * @return {Object} actual element
   */
  return function(key, object) {

    if (typeof object === 'object' && typeof object.$type === 'string') {

      var objectId = object.id;

      if (objectId && elCache[objectId]) {
        return elCache[objectId];
      }

      var type = object.$type;
      var attrs = Object.assign({}, object);

      delete attrs.$type;

      var newEl = moddle.create(type, attrs);

      if (objectId) {
        elCache[objectId] = newEl;
      }

      return newEl;
    }

    return object;
  };
}