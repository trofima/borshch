import {browserHistory} from '../../services'

const filterEmptyText = node => node.nodeType !== Node.TEXT_NODE 
      || node.nodeType === Node.TEXT_NODE && node.textContent.trim()

export default Base => class ChildrenObserver extends Base {
  #mutationObserver = new MutationObserver(mutations => {
    const {added, removed} = mutations.reduce(({added, removed}, {addedNodes, removedNodes}) => 
      ({added: [...added, ...addedNodes], removed: [...removed, ...removedNodes]}), {added: [], removed: []})

    this.onChildrenChanged({
      added: added.filter(filterEmptyText), 
      removed: removed.filter(filterEmptyText),
    });
  })

  connectedCallback() {
    super.connectedCallback()
    this.#mutationObserver.observe(this, {childList: true})
  }
  
  onChildrenChanged() {}
};
