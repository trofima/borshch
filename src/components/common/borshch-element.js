import {waitForElementToBeDefined} from '../../utilities'
import BorshchTransition from './borshch-transition'

export default class BorshchElement {
  constructor(htmlElement) {
    const {
      constructor: _, ...BorshchElementDescriptor
    } = Object.getOwnPropertyDescriptors(BorshchElementMixin().prototype)
    return Object.defineProperties(htmlElement, BorshchElementDescriptor)
  }
}

export function BorshchElementMixin(Base = class {}) {
  return class BorshchHtmlElement extends Base {
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

    getChildren() {
      return Array
        .from(this.children)
        .map(child => child instanceof BorshchHtmlElement ? child : new BorshchElement(child))
    }

    async getChildComponents(Type) {
      if (Type) {
        await waitForElementToBeDefined(Type)
        return Array
          .from(this.children)
          .filter(node => node.constructor === Type)
      }
      return []
    }
  }
}
