import render from './template.ejs';
import BaseRoute from '../common/BaseRoute.js';

export default class BorshchRouteNotFound extends BaseRoute {
  render() {
    return render();
  }
}
