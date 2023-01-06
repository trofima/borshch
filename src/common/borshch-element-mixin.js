import BorshchTransition from './borshch-transition'

export default (Base = class {}) => class BorshchElement extends Base {
  attachChild(htmlString) {
    const tpl = document.createElement('template')

    tpl.innerHTML = htmlString
    this.append(tpl.content.cloneNode(true))
  }

  removeChildren() {
    this.innerHTML = ''
  }

  setStyle(styles) {
    this.style.cssText = Object
      .entries(styles)
      .reduce((acc, [prop, style]) => `${acc} ${prop}: ${style};`, '')

    return this
  }

  transit(keyframes, {duration = 100, delay = 0, easing = 'linear'} = {}) {
    return new BorshchTransition(this.animate(keyframes, {duration, easing, delay, fill: 'forwards'}))
  }
}