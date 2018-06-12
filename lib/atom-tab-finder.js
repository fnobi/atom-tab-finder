'use babel';

import { CompositeDisposable } from 'atom';
import _ from 'lodash';
import glob from 'glob';
import sizeOf from 'image-size';
import AtomTabFinderView from './atom-tab-finder-view';
import ImageListView from './image-list-view';

const EXT = ['png', 'jpg', 'gif'];
const CSS_TEMPLATE = [
  'width: <%= widthCss %>;',
  'height: <%= heightCss %>;',
  'background-image: image-url(\'<%= basename %>\');',
].join('\n');

const makeCSS = _.template(CSS_TEMPLATE);

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

    const projectPath = paths[0];
    const publicPath = projectPath + '/public';

    glob(`${publicPath}/**/*.+(${EXT.join('|')})`, {}, (err, files) => {
      new ImageListView({
        files,
        onConfirm: opts => {
          this.tabFinderCSS(opts);
        },
      });
    });
  },

  tabFinderCSS: ({ basename, fullPath }) => {
    const editor = atom.workspace.getActiveTextEditor();
    const { width, height } = sizeOf(fullPath);
    const at = fullPath.match(/@([\d]+)x/);

    editor.insertText(
      makeCSS({
        basename,
        widthCss: at ? `(${width}px / ${at[1]})` : `${width}px`,
        heightCss: at ? `(${height}px / ${at[1]})` : `${height}px`,
      })
    );
  },
};
