import render from './borshch-link.ejs'
import {mixin, removeEndingSlash} from '../../utilities'
import {BorshchComponent, ReflectAttributes} from '../common'
import borshchRouterManager from './borshch-router-manager-instance'

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
    this.host.querySelector('a').addEventListener('click', e => e.preventDefault())
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
