import Component from '../../common/DeprecatedComponent.js'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import BorshchRoute from './BorshchRoute'
import BorshchDefaultRoute from './BorshchDefaultRoute'
import borshchRouterManager from './borshchRouterManagerInstance'
// import render from './borshchRouter.ejs'


//TODO: animations
//TODO: meta tags
//TODO: root
export default class BorshchRouter extends mixin(
  Component,
  ReflectAttributes(
    'root', 'transition', 'easing', 'direction',
    {name: 'duration', parse: Number, stringify: String},
  ),
) {
  // #containerRef = this.host()
  // #contentRef = this.host('#content')
  // #leavingRef = this.host('#leaving')

  render() {
    // return render()
    return ''
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
      container: this.host(),
      transition: {
        name: this.transition,
        duration: this.duration,
      },
    })
  }
}

customElements.define(BorshchRouter.componentName, BorshchRouter)
