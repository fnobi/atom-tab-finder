'use babel';

import { CompositeDisposable } from 'atom';
// import _ from 'lodash';
import AtomTabFinderView from './atom-tab-finder-view';
import ImageListView from './image-list-view';

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
        'atom-tab-finder:insert': () => this.insert(),
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

  insert() {
    const paths = atom.project.getPaths();
    if (!paths.length) {
      atom.notifications.addError('Projects are not found.');
      return;
    }

    const tabs = [{
      title: 'hoge',
    },{
      title: 'moge',
    }];

    new ImageListView({
      tabs,
      onConfirm: opts => {
        console.log(opts);
      },
    });
  },
};
