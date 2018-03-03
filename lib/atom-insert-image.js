'use babel';

import AtomInsertImageView from './atom-insert-image-view';
import { CompositeDisposable } from 'atom';

export default {
  atomInsertImageView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomInsertImageView = new AtomInsertImageView(
      state.atomInsertImageViewState
    );
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomInsertImageView.getElement(),
      visible: false,
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'atom-insert-image:toggle': () => this.toggle(),
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomInsertImageView.destroy();
  },

  serialize() {
    return {
      atomInsertImageViewState: this.atomInsertImageView.serialize(),
    };
  },

  toggle() {
    // console.log('AtomInsertImage was toggled!');
    return this.modalPanel.isVisible()
      ? this.modalPanel.hide()
      : this.modalPanel.show();
  },
};
