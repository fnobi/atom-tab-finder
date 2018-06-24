'use babel';

import { CompositeDisposable } from 'atom';
import _ from 'lodash';
import AtomTabFinderView from './atom-tab-finder-view';
import TabListView from './tab-list-view';

export default {
  atomTabFinderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.history = {};
    atom.workspace.observeTextEditors(editor => {
      const path = editor.getPath();
      if (path) this.registerHistory(path);
    });

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

  registerHistory(path) {
    this.history[path] = Date.now();
  },

  findTab() {
    const items = _(atom.workspace.getPaneItems())
      .filter(editor => editor.getTitle && editor.getPath && editor.getTitle() && editor.getPath())
      .map((editor) => {
        return {
          title: editor.getTitle(),
          path: editor.getPath(),
        };
      })
      .sortBy(({ path }) => {
        return this.history[path] || 0;
      })
      .reverse()
      .value();

    new TabListView({
      items,
      onConfirm: ({ path }) => {
        this.registerHistory(path);
        atom.workspace.open(path);
      },
    });
  },
};
