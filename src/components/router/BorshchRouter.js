import {BorshchComponent} from '../../common/Component'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import BorshchRoute from './BorshchRoute'
import BorshchDefaultRoute from './BorshchDefaultRoute'
import borshchRouterManager from './borshch-router-manager-instance'
import render from './borshchRouter.ejs'

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

    //TODO: get meta tags, construct BorshchElement from them and pass to borshchRouterManager 
    //TODO: or setDescription, setKeywords? of some 'document' dependency with those functions?
    //TODO: pass setTitle function or something like that.

    borshchRouterManager.init({
      defaultRoute,
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
