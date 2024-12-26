import {mixin} from '../../utilities/index.js'
import {BorshchComponent, ReflectAttributes} from '../common/index.js'
import BorshchRoute from './borshch-route.js'
import BorshchDefaultRoute from './borshch-default-route.js'
import borshchRouterManager from './borshch-router-manager-instance.js'
import render from './borshch-router.ejs'

class BorshchRouter extends mixin(
  BorshchComponent,
  ReflectAttributes(
    'title', 'transition', 'easing', 'direction',
    {name: 'duration', parse: Number, stringify: String},
  ),
) {
  render() {
    return render()
  }

  async onConnected() {
    super.onConnected()

    const [routes, [defaultRoute]] = await Promise.all([
      this.getChildComponents(BorshchRoute),
      this.getChildComponents(BorshchDefaultRoute),
    ])

    borshchRouterManager.init({
      defaultRoute,
      title: this.title,
      routes: routes,
      container: this.host,
      transition: {
        name: this.transition,
        duration: this.duration,
      },
    })

    borshchRouterManager.renderRoute()
  }
}

export default BorshchRouter.define()
