'use strict';

var forEach = require('lodash/collection/forEach'),
    clone = require('lodash/lang/clone');

var domClasses = require('min-dom/lib/classes'),
    domQuery = require('min-dom/lib/query');

function UpdateEntriesHandler() { }

module.exports = UpdateEntriesHandler;


function toggleEntry(entry, containerClass) {

  var container = domQuery(containerClass);
  var entryElement = domQuery('[data-id="' + entry.id + '"]', container);

  if (!entryElement) {
    return;
  }

  if (entry.active) {
    domClasses(entryElement).add('active');
  } else if (domClasses(entryElement).has('active')){
    domClasses(entryElement).remove('active');
  }

  if (entry.disabled) {
    domClasses(entryElement).add('disabled');
  } else if (domClasses(entryElement).has('disabled')) {
    domClasses(entryElement).remove('disabled');
  }
}


UpdateEntriesHandler.prototype.execute = function(context) {

  context.oldEntries = clone(context.entries, true);

  // replace current entry items with the new ones
  context.entries.splice(0, context.entries.length);
  forEach(context.newEntries, function(newEntry){
    context.entries.push(newEntry);
    toggleEntry(newEntry, context.entriesContainerClass);
  });
};


UpdateEntriesHandler.prototype.revert = function(context) {

  context.newEntries = clone(context.entries, true);

  // replace current entry items with the old ones
  context.entries.splice(0, context.entries.length);
  forEach(context.oldEntries, function(oldEntry){
    context.entries.push(oldEntry);
    toggleEntry(oldEntry, context.entriesContainerClass);
  });
};
