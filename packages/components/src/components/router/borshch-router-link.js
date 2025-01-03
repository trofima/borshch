import {mixin} from '@borshch/utilities'
import render from './borshch-router-link.ejs'
import {removeEndingSlash} from '../../utilities/index.js'
import {BorshchComponent, ReflectAttributes} from '../common/index.js'
import borshchRouterManager from './borshch-router-manager-instance.js'

class BorshchRouterLink extends mixin(
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

 export default BorshchRouterLink.define()
