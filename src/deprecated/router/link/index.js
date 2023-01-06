import render from './template.ejs';
import routerStore from '../store';
import mixin, {ReflectAttributes} from '../../common/utils/mixin';
import {connect} from '../../common/store.js';
import {BorshchComponent} from '../../common/Component.js';
import {removeEndingSlash} from '../../common/utils';

export default class BorshchLink extends mixin(
  BorshchComponent,
  ReflectAttributes('active', {name: 'path', stringify: removeEndingSlash}),
  connect(routerStore),
) {
  constructor(...args) {
    super(...args);
    this.path = removeEndingSlash(this.path);
  }

  render() {
    return render({href: this.path});
  }

  onConnected() {
    super.onConnected();
    this.addEventListener('click', () => routerStore.navigate(this.path));
    this.host('a').on('click', e => e.preventDefault());
  }

  onStore() {
    return {
      navigate: ({path}) => this.active = path === this.path,
    }
  }
}
