import Component from '../../common/Component.js'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import BorshchRoute from './BorshchRoute'
import BorshchDefaultRoute from './BorshchDefaultRoute'
import render from './borshchRouter.ejs'
import borshchRouterManager from './borshchRouterManagerInstance'


//TODO: animations
//TODO: meta tagss
export default class BorshchRouter extends mixin(
  Component,
  ReflectAttributes(
    'root', 'transition', 'easing', 'direction',
    {name: 'duration', parse: Number, stringify: String},
  ),
) {
  #contentRef = this.host('#content')

  render() {
    return render()
  }

  async onConnected() {
    super.onConnected()

    const [routes, [defaultRoute]] = await Promise.all([
      this.getChildren(BorshchRoute),
      this.getChildren(BorshchDefaultRoute),
    ])

    borshchRouterManager.init({
      defaultRoute,
      routes: routes,
      structure: {
        content: this.#contentRef,
      },
    })
  }
}

customElements.define(BorshchRouter.componentName, BorshchRouter);
