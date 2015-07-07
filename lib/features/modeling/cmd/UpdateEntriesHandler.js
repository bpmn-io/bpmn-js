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

UpdateEntriesHandler.prototype.preExecute = function(context) {
  var containerClass = context.entriesContainerClass;

  context.container = domQuery(containerClass);
};

UpdateEntriesHandler.prototype.execute = function(context) {
  var container = context.container;

  context.oldEntries = clone(context.entries, true);

  // replace current entry items with the new ones
  context.entries.splice(0, context.entries.length);

  forEach(context.newEntries, function(newEntry){
    context.entries.push(newEntry);

    toggleEntry(newEntry, container);
  });
};


UpdateEntriesHandler.prototype.revert = function(context) {
  var container = context.container;

  context.oldEntries = clone(context.entries, true);

  // replace current entry items with the new ones
  context.entries.splice(0, context.entries.length);

  forEach(context.newEntries, function(newEntry){
    context.entries.push(newEntry);

    toggleEntry(newEntry, container);
  });
};
