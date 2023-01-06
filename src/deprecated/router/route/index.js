import render from './template.ejs';
import BaseRoute from '../common/BaseRoute.js';
import mixin, {ReflectAttributes} from '../../common/utils/mixin';
import {removeEndingSlash} from '../../common/utils';

export default class BorshchRoute extends mixin(
  BaseRoute,
  ReflectAttributes({name: 'path', stringify: removeEndingSlash}),
) {
  constructor(...args) {
    super(...args);
    this.path = removeEndingSlash(this.path);
  }

  render() {
    return render();
  }
}
