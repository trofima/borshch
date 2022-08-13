import BorshchDefaultRoute from './BorshchDefaultRoute'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import {removeEndingSlash} from '../../common/utils'

export default class BorshchRoute extends mixin(
  BorshchDefaultRoute,
  ReflectAttributes({name: 'path', stringify: removeEndingSlash}),
) {
  constructor(...args) {
    super(...args)
    this.path = removeEndingSlash(this.path)
  }
}

customElements.define(BorshchRoute.componentName, BorshchRoute)
