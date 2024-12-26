import {waitForElementToBeDefined, convertPascalToDashCase, mixin} from '../../utilities'
import BorshchTransition from './borshch-transition'

export const BorshchHtmlElement = BorshchHtmlElementOf()

function BorshchHtmlElementOf(Base = class {}) {
  return class BorshchHtmlElement extends Base {
    static of(htmlElement) {
      const {
        constructor: _, ...BorshchElementDescriptor
      } = Object.getOwnPropertyDescriptors(BorshchHtmlElement.prototype)
      return Object.defineProperties(htmlElement, BorshchElementDescriptor)
    }

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
        .map(child => child instanceof BorshchHtmlElement ? child : new BorshchElementOf(child))
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

export function BorshchElementOf(BaseHtmlElement) {
  return class BorshchElement extends mixin(BaseHtmlElement, BorshchHtmlElementOf) {
    static get componentName() {
      return convertPascalToDashCase(this.name || this.__proto__.name) //HACK: __proto__ - is the Safari hack
    }

    static define() {
      customElements.define(this.componentName, this)
      return this
    }

    static get observedAttributes() {return []}

    get attributeChangeListeners() {return {}}

    connectedCallback() {
      /**
       * Called every time the element is inserted into the DOM.
       * Useful for running setup code, such as fetching resources or rendering.
       * Generally, you should try to delay work until this time.
       * */
      this.onConnected()
    }

    disconnectedCallback() {
      /**
       * Called every time the element is removed from the DOM.
       * Useful for running clean up code (removing event listeners, etc.).
       * */
      this.onDisconnected()
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
      /**
       * An attribute was added, removed, updated, or replaced.
       * Also called for initial values when an element is created by the parser, or upgraded.
       * Note: only attributes listed in the observedAttributes property will receive this callback.
       * */
      this.attributeChangeListeners[attrName]?.(newVal, oldVal)
    }

    adoptedCallback() {
      /**
       * The custom element has been moved into a new document
       * (e.g. someone called document.adoptNode(el)).
       * */
      this.onAdopted()
    }

    onConnected() {}

    onDisconnected() {}

    onAdopted() {}
  }
}
