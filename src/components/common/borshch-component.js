import {mixin, convertPascalToDashCase, waitForElementToBeDefined} from '../../utilities'
import BorshchElementMixin from './borshch-element-mixin'

export default class BorshchComponent extends mixin(HTMLElement, BorshchElementMixin) {
  static get componentName() {
    return convertPascalToDashCase(this.name || this.__proto__.name) //HACK: __proto__ - is the Safari hack
  }

  static define() {
    customElements.define(this.componentName, this)
    return this
  }

  static get observedAttributes() {return []}

  constructor() {
    super()
    const {
      constructor: _, ...BorshchElementDescriptor
    } = Object.getOwnPropertyDescriptors(BorshchElementMixin().prototype)
    this.attachShadow({mode: 'open'})
    this.#host = Object.defineProperties(this.shadowRoot, BorshchElementDescriptor)
  }

  get host() {return this.#host}
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

  onConnected() {
    this.#attach(this.render())
  }

  onDisconnected() {}

  onAdopted() {}

  render() {
    return ''
  }

  async getChildren(Type) { //TODO: gets only child borshch components. rename
    if (Type) {
      await waitForElementToBeDefined(Type)
      return Array
        .from(this.children)
        .filter(node => node instanceof Type)
    }

    return Array.from(this.children) // TODO: ? .map(child => new BorshchElement(child))
  }

  #attach(html) {
    const tpl = document.createElement('template')

    tpl.innerHTML = html
    this.#applyShadyCss(tpl)
    this.#host.appendChild(tpl.content.cloneNode(true))
  }

  #applyShadyCss(tpl) {
    if (window.ShadyCSS) { //if browser doesn't support style scoping in shadow dom
      window.ShadyCSS.prepareTemplate(tpl, this.constructor.componentName)
      window.ShadyCSS.styleElement(this)
    }
  }

  #host
}
