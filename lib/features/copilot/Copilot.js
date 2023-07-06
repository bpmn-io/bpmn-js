import { isNil } from 'min-dash';

import { clear as svgClear } from 'tiny-svg';

export default class Copilot {
  constructor(
      canvas,
      createPreview,
      directEditing,
      eventBus,
      keyboard,
      modeling,
      selection) {
    this._canvas = canvas;
    this._createPreview = createPreview;
    this._directEditing = directEditing;
    this._modeling = modeling;
    this._selection = selection;

    eventBus.on('selection.changed', (context) => {
      const { newSelection } = context;

      this.clearSuggestion();

      if (newSelection.length === 1) {
        this.makeSuggestion(newSelection[ 0 ]);
      }
    });

    eventBus.on('directEditing.activate', () => {
      this.hideSuggestion();
    });

    eventBus.on('directEditing.deactivate', () => {
      this.showSuggestion();
    });

    keyboard.addListener((context) => {
      if (context.keyEvent.key === 'Tab') {
        context.keyEvent.preventDefault();

        this.acceptSuggestion();
      } else if (context.keyEvent.key === 'Escape') {
        this.clearSuggestion();
      }
    });

    this._suggestion = null;

    this._layer = canvas.getLayer('copilot', 1000);
  }

  acceptSuggestion() {
    console.log('acceptSuggestion');

    if (!this._suggestion) {
      return;
    }

    const {
      connectionSource,
      connectionTarget,
      elements,
      position,
      target
    } = this._suggestion;

    const createdElements = this._modeling.createElements(elements, position, target, {
      position: 'absolute'
    });

    if (connectionSource && connectionTarget) {
      this._modeling.connect(connectionSource, connectionTarget);
    }

    this.clearSuggestion();

    if (createdElements.length === 1) {
      this._selection.select(createdElements[ 0 ]);

      this._directEditing.activate(createdElements[ 0 ]);
    }
  }

  async makeSuggestion(element) {
    console.log('makeSuggestion');

    const suggestion = this._suggestion = await this.createSuggestion(element);

    console.log('suggestion', suggestion);

    if (!suggestion) {
      return;
    }

    const {
      connection,
      elements
    } = suggestion;

    const group = this._createPreview.createPreview([
      connection,
      ...elements
    ].filter(element => !isNil(element)));

    this._layer.appendChild(group);
  }

  showSuggestion() {
    console.log('showSuggestion');

    this._canvas.showLayer('copilot');
  }

  hideSuggestion() {
    console.log('hideSuggestion');

    this._canvas.hideLayer('copilot');
  }

  clearSuggestion() {
    console.log('clearSuggestion');

    this._suggestion = null;

    svgClear(this._layer);
  }

  createSuggestion(element) {
    console.log('createSuggestion');

    if (!this._provider) {
      return null;
    }

    return this._provider.createSuggestion(element);
  }

  setProvider(provider) {
    this._provider = provider;
  }
}

Copilot.$inject = [
  'canvas',
  'createPreview',
  'directEditing',
  'eventBus',
  'keyboard',
  'modeling',
  'selection'
];
