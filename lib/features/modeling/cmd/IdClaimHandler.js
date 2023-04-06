/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 *
 * @typedef {import('../../../model/Types').Moddle} Moddle
 */

/**
 * @implements {CommandHandler}
 *
 * @param {Moddle} moddle
 */
export default function IdClaimHandler(moddle) {
  this._moddle = moddle;
}

IdClaimHandler.$inject = [ 'moddle' ];


IdClaimHandler.prototype.execute = function(context) {
  var ids = this._moddle.ids,
      id = context.id,
      element = context.element,
      claiming = context.claiming;

  if (claiming) {
    ids.claim(id, element);
  } else {
    ids.unclaim(id);
  }

  return [];
};

/**
 * Command revert implementation.
 */
IdClaimHandler.prototype.revert = function(context) {
  var ids = this._moddle.ids,
      id = context.id,
      element = context.element,
      claiming = context.claiming;

  if (claiming) {
    ids.unclaim(id);
  } else {
    ids.claim(id, element);
  }

  return [];
};

