import {mixin} from '../../utilities/index.js'
import {BorshchComponent, ReflectAttributes} from '../common/index.js'

export class BorshchDefaultRoute extends mixin(
  BorshchComponent,
  ReflectAttributes('name', 'description'),
) {
  get rendered() {return this.#rendered}

  onConnected() {
    this.#template = this.#areChildrenValid()
      ? this.children[0]
      : document.createElement('template')
  }

  onDisconnected() {}

  render() {
    this.host.replaceChildren(this.#template.content.cloneNode(true))
    this.#rendered = true
  }

  clear() {
    this.host.removeChildren()
    this.#rendered = false
  }

  #template = null
  #rendered = false

  #areChildrenValid() {
    const tpl = this.children[0]

    if (!tpl) {
      console.error('Component BorshchRoute: the route is empty so it won\'t render anything. That\'s seems to be stupid to have no any content.')
      return false
    } else if (this.children.length > 1 || tpl.tagName !== 'TEMPLATE') {
      console.error('Component BorshchRoute: should have only one child. And this child has to be a <template> tag. Put all your content inside.')
      return false
    }

    return true
  }
}

export default BorshchDefaultRoute.define()
