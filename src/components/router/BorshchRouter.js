import Component from '../../common/Component.js'
import BorshchRoute from './BorshchRoute'
import BorshchDefaultRoute from './BorshchDefaultRoute'
import render from './borshchRouter.ejs'
import borshchRouterManager from './borshchRouterManagerInstance'

export default class BorshchRouter extends Component {
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
