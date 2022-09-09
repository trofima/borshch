import renderTpl from './template.ejs'
import Component from '../common/DeprecatedComponent'
import mixin, {HistoryListener, ReflectAttributes} from '../common/utils/mixin'

export default class BorshchAnchorNav extends mixin(
  Component, HistoryListener, ReflectAttributes({name: 'hashPart', parse: Number})
) {
  #anchors = []
  #hashAnchorMap = new Map()
  #activeAnchor = null

  render() {
    return renderTpl()
  }

  async onConnected() {
    super.onConnected()

    this.#anchors = (await this.getFromSlot('#default', HTMLAnchorElement))
    this.#anchors.forEach(child => this.#hashAnchorMap.set(child.hash, child))
  }

  onHistory() {
    return {
      hashchange: ({hash, hashParts}) => {
        const anchor = hashParts.find(hashPart => this.#hashAnchorMap.has(hashPart)) || hash
        const next = this.#hashAnchorMap.get(anchor)

        if (next && next !== this.#activeAnchor) {
          if (this.#activeAnchor) this.#activeAnchor.classList.remove('active')
          next.classList.add('active')
          this.#activeAnchor = next
        }
      },
    }
  }
}

customElements.define(BorshchAnchorNav.componentName, BorshchAnchorNav)