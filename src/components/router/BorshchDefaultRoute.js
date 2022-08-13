import Component from '../../common/Component.js'

function valid(children) {
  const tpl = children[0]

  if (!tpl) {
    console.error('Component Route: the route is empty so it won\'t render anything. That\'s seems to be stupid to have no any content.')
    return false
  } else if (children.length > 1 || tpl.tagName !== 'TEMPLATE') {
    console.error('Component Route: should have only one child. And this child has to be a <template> tag. Put all your content inside.')
    return false
  }

  return true
}

export default class BorshchDefaultRoute extends Component {
  constructor(...args) {
    super(...args)
    this.tpl = null
  }

  onConnected() {
    this.tpl = valid(this.children) ? this.children[0] : document.createElement('template')
  }

  onDisconnected() {}

  render() {
    this.host().replace(this.tpl.content.cloneNode(true))
  }

  clear() {
    this.host().clear()
  }

  setStyle(style) {
    this.element().setStyle(style)
  }
}

customElements.define(BorshchDefaultRoute.componentName, BorshchDefaultRoute)
