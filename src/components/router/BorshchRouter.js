import {BorshchComponent} from '../../common/Component'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import BorshchRoute from './BorshchRoute'
import BorshchDefaultRoute from './BorshchDefaultRoute'
import borshchRouterManager from './borshchRouterManagerInstance'
import render from './borshchRouter.ejs'
import {BrowserHistory} from '../../dependencies'


//TODO: meta tags
//TODO: root
class BorshchRouter extends mixin(
  BorshchComponent,
  ReflectAttributes(
    'root', 'transition', 'easing', 'direction',
    {name: 'duration', parse: Number, stringify: String},
  ),
) {
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
      container: this.host,
      history: new BrowserHistory(),
      transition: {
        name: this.transition,
        duration: this.duration,
      },
    })

    borshchRouterManager.renderRoute()
  }
}

export default BorshchRouter.define()
