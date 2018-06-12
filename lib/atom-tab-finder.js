'use babel';

import { CompositeDisposable } from 'atom';
// import _ from 'lodash';
import AtomTabFinderView from './atom-tab-finder-view';
import TabListView from './tab-list-view';

export default {
  atomTabFinderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomTabFinderView = new AtomTabFinderView(
      state.atomTabFinderViewState
    );
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomTabFinderView.getElement(),
      visible: false,
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'tab-finder:find-tab': () => this.findTab(),
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomTabFinderView.destroy();
  },

  serialize() {
    return {
      atomTabFinderViewState: this.atomTabFinderView.serialize(),
    };
  },

  findTab() {
    const panes = atom.workspace.getPaneItems();
    new TabListView({
      panes,
      onConfirm: ({ path }) => {
        atom.workspace.open(path);
      },
    });
  },
};
