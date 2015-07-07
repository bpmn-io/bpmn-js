'use strict';

var forEach = require('lodash/collection/forEach'),
    clone = require('lodash/lang/clone');

var domClasses = require('min-dom/lib/classes'),
    domQuery = require('min-dom/lib/query');

function UpdateEntriesHandler() { }

module.exports = UpdateEntriesHandler;


function toggleEntry(entry, container) {

  var entryElement = domQuery('[data-id="' + entry.id + '"]', container);

  if (!entryElement) {
    return;
  }

  if (domClasses(entryElement).has('active')){
    domClasses(entryElement).remove('active');
  }

  if (entry.active) {
    domClasses(entryElement).add('active');
  }

  if (domClasses(entryElement).has('disabled')) {
    domClasses(entryElement).remove('disabled');
  }

  if (entry.disabled) {
    domClasses(entryElement).add('disabled');
  }
}

UpdateEntriesHandler.prototype.execute = function(context) {

  var container = domQuery(context.entriesContainerClass);

  context.oldEntries = clone(context.entries, true);

  // replace current entry items with the new ones
  context.entries.splice(0, context.entries.length);

  forEach(context.newEntries, function(newEntry){
    context.entries.push(newEntry);
    if (container) {
        toggleEntry(newEntry, container);
    }

  });
};


UpdateEntriesHandler.prototype.revert = function(context) {

  var container = domQuery(context.entriesContainerClass);

  context.newEntries = clone(context.entries, true);

  // replace current entry items with the new ones
  context.entries.splice(0, context.entries.length);

  forEach(context.oldEntries, function(oldEntry){
    context.entries.push(oldEntry);

    if (container) {
        toggleEntry(oldEntry, container);
    }
  });
};
