import render from './borshchLink.ejs'
import mixin, {ReflectAttributes} from '../../common/utils/mixin'
import Component from '../../common/Component.js'
import {removeEndingSlash} from '../../common/utils'
import borshchRouterManager from './borshchRouterManagerInstance'

export default class BorshchLink extends mixin(
  Component,
  ReflectAttributes('active', {name: 'path', stringify: removeEndingSlash}),
) {
  constructor(...args) {
    super(...args);
    this.path = removeEndingSlash(this.path)
    borshchRouterManager.on('pathChange', ({nextPath}) => this.active = nextPath === this.path)
  }

  render() {
    return render({href: this.path});
  }

  onConnected() {
    super.onConnected();

    this.addEventListener('click', () => borshchRouterManager.navigate(this.path));
    this.host('a').on('click', e => e.preventDefault());
  }
}

customElements.define(BorshchLink.componentName, BorshchLink)
