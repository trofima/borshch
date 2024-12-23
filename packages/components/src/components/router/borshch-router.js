import {mixin} from '../../utilities'
import {BorshchComponent, ReflectAttributes} from '../common'
import BorshchRoute from './borshch-route'
import BorshchDefaultRoute from './borshch-default-route'
import borshchRouterManager from './borshch-router-manager-instance'
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
