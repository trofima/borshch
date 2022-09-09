import {pascalToDashCase, elementDefined} from '../utilities'

//TODO: Come up with way to reuse this interface with HTMLElement (can't be constructed)
export class BorshchElement {
  constructor(element) {
    this.#element = element
  }

  get element() {return this.#element}

  appendChild(element) {
    this.#element.append(element)
  }

  removeChild(element) {
    this.#element.removeChild(element)
  }

  replaceChildren(...elements) {
    this.#element.innerHTML = ''
    this.#element.append(...elements)
  }

  attachChild(htmlString) {
    const tpl = document.createElement('template')

    tpl.innerHTML = htmlString
    this.#element.append(tpl.content.cloneNode(true))
  }

  removeChildren() {
    this.#element.innerHTML = ''
  }

  setStyle(styles) {
    this.#element.style.cssText = Object
      .keys(styles)
      .reduce((acc, prop) => `${acc} ${prop}: ${styles[prop]};`, '')

    return this
  }

  animate(keyframes, options) {
    const animation = this.#element.animate(keyframes, options)

    return {
      get playing() {return animation.finished},

      finish: () => animation.finish(),
    }
  }

  select(selector) {
    return this.#element.querySelectorAll(selector)
  }

  #element
}

export class BorshchHtmlElement extends HTMLElement {
  appendChild(element) {
    this.append(element)
  }

  removeChild(element) {
    super.removeChild(element)
  }

  replaceChildren(...elements) {
    this.innerHTML = ''
    this.append(...elements)
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
      .keys(styles)
      .reduce((acc, prop) => `${acc} ${prop}: ${styles[prop]};`, '')

    return this
  }

  animate(keyframes, options) {
    const animation = super.animate(keyframes, options)

    return {
      get playing() {return animation.finished},
      get playState() {return animation.playState},

      finish: () => animation.finish(),
    }
  }

  select(selector) {
    return this.querySelectorAll(selector)
  }
}

export class BorshchComponent extends BorshchHtmlElement {
  static get componentName() {
    return pascalToDashCase(this.name || this.__proto__.name) //HACK: __proto__ - is the Safari hack
  }

  static define() {
    customElements.define(this.componentName, this)
    return this
  }

  static get observedAttributes() {return []}

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.#host = new BorshchElement(this.shadowRoot)
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

  async getChildren(Type) {
    if (Type) {
      await elementDefined(Type)
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
