import Ids from 'ids';

import { createReviver } from '../native-clipboard/NativeClipboard';

import {
  domify,
  query as domQuery,
  remove as domRemove
} from 'min-dom';

var ids = new Ids();

export default function Snippets(canvas, copyPaste, create, moddle, mouse) {
  this._canvas = canvas;
  this._copyPaste = copyPaste;
  this._create = create;
  this._moddle = moddle;
  this._mouse = mouse;

  this.snippets = [];

  var stored = localStorage.getItem('snippets');

  if (stored) {
    this.snippets = JSON.parse(stored);
  }
}

Snippets.prototype.save = function(elements) {
  var tree = this._copyPaste.createTree(elements);

  var json = JSON.stringify(tree);

  var snippet = {
    id: ids.next(),
    snippet: json
  };

  this.openSaveSnippetModal(snippet);
};

Snippets.prototype.openSnippetsModal = function(snippet) {
  var self = this;

  var modal = domify(`
    <div class="modal-outer">
      <div class="modal-inner">
        <h3>Create Snippet</h3>
        <div class="form-group">
          <label for="snippet">Choose Snippet</label>
          <select id="snippet"></select>
        </div>
        <button>Create</button>
      </div>
    </div>`
  );

  var select = domQuery('select', modal);

  select.addEventListener('keydown', function(e) {
    // if (e.key === 'Enter') {
    //   var snippet = self.snippets.find(function(s) {
    //     return s.id === select.value;
    //   });

    //   self.createSnippet(snippet);

    //   domRemove(modal);
    // }

    e.stopPropagation();
    // e.preventDefault();
  });

  select.addEventListener('keyup', function(e) {
    // e.stopPropagation();
    // e.preventDefault();
  });

  this.snippets.forEach(function(s) {
    select.appendChild(domify(`<option value="${ s.id }">${ s.name }</option>`));
  });

  var button = domQuery('button', modal);

  button.addEventListener('click', function() {
    var snippet = self.snippets.find(function(s) {
      return s.id === select.value;
    });

    self.createSnippet(snippet);

    domRemove(modal);
  });

  this._canvas.getContainer().appendChild(modal);

  select.focus();
};

Snippets.prototype.openSaveSnippetModal = function(snippet) {
  var self = this;

  var modal = domify(`
    <div class="modal-outer">
      <div class="modal-inner">
        <h3>Save Snippet</h3>
        <div class="form-group">
          <label for="snippet">Name</label>
          <input id="snippet" type="text" placeholder="Snippet" />
        </div>
        <button>Save</button>
      </div>
    </div>`
  );

  var input = domQuery('input', modal);

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      snippet.name = input.value;

      self.snippets.push(snippet);

      localStorage.setItem('snippets', JSON.stringify(self.snippets));

      domRemove(modal);
    }
  });

  var button = domQuery('button', modal);

  button.addEventListener('click', function() {
    snippet.name = input.value;

    self.snippets.push(snippet);

    localStorage.setItem('snippets', JSON.stringify(self.snippets));

    domRemove(modal);
  });

  this._canvas.getContainer().appendChild(modal);

  input.focus();
};

Snippets.prototype.getSnippets = function() {
  return this.snippets;
};

Snippets.prototype.createSnippet = function(snippet) {
  const reviver = createReviver(this._moddle);

  const revived = JSON.parse(snippet.snippet, reviver);

  var elements = this._copyPaste._createElements(revived);

  this._create.start(this._mouse.getLastMoveEvent(), elements, {
    hints: {
      createElementsBehavior: false
    }
  });
};

Snippets.$inject = [ 'canvas', 'copyPaste', 'create', 'moddle', 'mouse' ];