'use babel';

import path from 'path';
import SelectList from 'atom-select-list';
import _ from 'lodash';

export default class ImageListView {
  constructor({ tabs, onConfirm }) {
    this.onConfirm = onConfirm || new Function();

    this.selectList = new SelectList({
      items: this.createImageArray(tabs),
      elementForItem: item => {
        return this.createElementForItem(item);
      },
      filterKeyForItem: item => {
        return item.basename;
      },
      didConfirmSelection: item => {
        this.confirmed(item);
      },
      didCancelSelection: () => {
        this.hide();
      },
    });

    this.show();
    this.currentPane = atom.workspace.getActivePane();
  }

  show() {
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({
        item: this.selectList,
      });
    }
    this.panel.show();
    this.selectList.focus();
  }

  hide() {
    if (this.panel) {
      this.panel.destroy();
    }
  }

  createImageArray(files = []) {
    return _(files)
      .map(fullPath => {
        return {
          fullPath,
          basename: path.basename(fullPath),
        };
      })
      .value();
  }

  createElementForItem({ basename, fullPath }) {
    const li = document.createElement('li');
    li.classList.add('two-lines');

    const primary = document.createElement('div');
    primary.classList.add('primary-line', 'file', 'icon', 'icon-file-text');
    primary.innerHTML = basename;
    li.appendChild(primary);

    const secondary = document.createElement('div');
    secondary.classList.add('secondary-line');
    secondary.innerHTML = fullPath;
    li.appendChild(secondary);

    return li;
  }

  confirmed(item) {
    this.onConfirm(item);
    this.hide();
    if (this.currentPane.isAlive()) {
      this.currentPane.activate();
    }
  }
}
