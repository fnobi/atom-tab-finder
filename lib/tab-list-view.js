'use babel';

import SelectList from 'atom-select-list';
import _ from 'lodash';

export default class TabListView {
  constructor({ editors, onConfirm }) {
    this.onConfirm = onConfirm || new Function();

    this.selectList = new SelectList({
      items: this.createTabArray(editors),
      elementForItem: item => {
        return this.createElementForItem(item);
      },
      filterKeyForItem: item => {
        return item.path;
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

  createTabArray(editors = []) {
    return _(editors)
      .filter(editor => editor.getTitle && editor.getPath && editor.getTitle() && editor.getPath())
      .map((editor) => {
        return {
          title: editor.getTitle(),
          path: editor.getPath(),
        };
      })
      .value();
  }

  createElementForItem({ title, path }) {
    const li = document.createElement('li');
    li.classList.add('two-lines');

    const primary = document.createElement('div');
    primary.classList.add('primary-line', 'file', 'icon', 'icon-file-text');
    primary.innerHTML = title;
    li.appendChild(primary);

    const secondary = document.createElement('div');
    secondary.classList.add('secondary-line');
    secondary.innerHTML = path;
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
