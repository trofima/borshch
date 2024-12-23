import {mixin, removeEndingSlash} from '../../utilities'
import {BorshchDefaultRoute} from './borshch-default-route'
import {ReflectAttributes} from '../common'

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
