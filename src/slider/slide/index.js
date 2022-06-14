import render from './template.ejs';
import Slider from '../slider';
import Component from '../../common/Component.js';
import mixin, {ReflectAttributes, HistoryListener} from '../../common/utils/mixin';

export default class BorshchSlide extends mixin(Component, ReflectAttributes('hash'), HistoryListener) {
  constructor(...args) {
    super(...args);
    this.subSlider = undefined;
  }

  render() {
    return render();
  }

  async onConnected() {
    super.onConnected();

    this.subSlider = (await this.getFromSlot('#default', Slider))[0];
  }

  displayed() {
    if (this.subSlider) this.subSlider.switchSlide(0);
  }
}
