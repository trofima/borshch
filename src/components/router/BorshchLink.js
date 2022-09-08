import render from './borshchLink.ejs'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import {BorshchComponent} from '../../common/Component.js'
import {removeEndingSlash} from '../../common/utils'
import borshchRouterManager from './borshchRouterManagerInstance'

class BorshchLink extends mixin(
  BorshchComponent,
  ReflectAttributes('active', {name: 'path', stringify: removeEndingSlash}),
) {
  constructor(...args) {
    super(...args)
    this.path = removeEndingSlash(this.path)
  }

  render() {
    return render({href: this.path})
  }

  onConnected() {
    super.onConnected()
    this.addEventListener('click', this.#navigate)
    borshchRouterManager.on('pathChange', this.#setActive)
    this.host.select('a')[0].addEventListener('click', e => e.preventDefault())
  }

  onDisconnected() {
    super.onDisconnected()
    this.removeEventListener('click', this.#navigate)
    borshchRouterManager.off('pathChange', this.#setActive)
  }

  #navigate = () => borshchRouterManager.navigate(this.path)
  #setActive = ({nextPath}) => this.active = nextPath === this.path
}

 export default BorshchLink.define()
