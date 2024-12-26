import {mixin, removeEndingSlash} from '../../utilities/index.js'
import {BorshchDefaultRoute} from './borshch-default-route.js'
import {ReflectAttributes} from '../common/index.js'

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
