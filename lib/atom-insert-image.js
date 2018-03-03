'use babel';

import { CompositeDisposable } from 'atom';
import glob from 'glob';
import sizeOf from 'image-size';
import AtomInsertImageView from './atom-insert-image-view';
import ImageListView from './image-list-view';

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
        'atom-insert-image:insert': () => this.insert(),
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

  insert() {
    const paths = atom.project.getPaths();
    if (!paths.length) {
      atom.notifications.addError('Projects are not found.');
      return;
    }

    const projectPath = paths[0];
    const publicPath = projectPath + '/public';
    const EXT = ['png', 'jpg', 'gif'];

    glob(`${publicPath}/**/*.+(${EXT.join('|')})`, {}, (err, files) => {
      new ImageListView({
        files,
        onConfirm: ({ basename, fullPath }) => {
          const editor = atom.workspace.getActiveTextEditor();
          const { width, height } = sizeOf(fullPath);
          const at = fullPath.match(/@([\d]+)x/);
          const widthExp = at ? `(${width}px / ${at[1]})` : `${width}px`;
          const heightExp = at ? `(${height}px / ${at[1]})` : `${height}px`;

          editor.insertText(
            [
              `width: ${widthExp};`,
              `height: ${heightExp};`,
              `background-image: image-url('${basename}');`,
            ].join('\n')
          );
        },
      });
    });
  },
};
