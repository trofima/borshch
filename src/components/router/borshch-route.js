import {BorshchDefaultRoute} from './borshch-default-route'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import {removeEndingSlash} from '../../utilities'

class BorshchRoute extends mixin(
  BorshchDefaultRoute,
  ReflectAttributes({name: 'path', stringify: removeEndingSlash}),
) {
  constructor(...args) {
    super(...args)
    this.path = removeEndingSlash(this.path)
  }
}

export default BorshchRoute.define()