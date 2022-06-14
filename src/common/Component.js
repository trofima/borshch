import ExtendedMap from './utils/ExtendedMap.js'
import Deferred from './utils/Deferred.js'

const pascalToDashCase = str => str
  ? str.replace(/([A-Z])/g, (match, upperCaseLetter, offset) =>
      `${offset ? '-' : ''}${upperCaseLetter[0].toLowerCase()}`)
  : ''

const bindTo = (el, eventName, listener) => el.addEventListener(eventName, listener)
const unbindFrom = (el, eventName, listener) => el.removeEventListener(eventName, listener)
const elementNotFound = selector => () =>
  console.warn(`Component: Nothing was found by the selector: ${selector}. Listeners weren't added.\nProbably you are binding before connect or the selector really doesn't match anything.`)
const whenDefined = async Type => Type.componentName && (await customElements.whenDefined(Type.componentName))

const applyOnEachElementFrom = (selection, fn, onError) => {
  if (selection instanceof Element || selection instanceof Window || selection instanceof Document)
    return fn(selection)
  else if (selection instanceof NodeList)
    return selection.forEach(el => fn(el))

  return onError()
}

const createNodeFrom = html => {
  const tpl = document.createElement('template')

  tpl.innerHTML = html
  
  return tpl.content.cloneNode(true)
}

class BaseElementWrapper {
  #animation
  #elementEventMap
  #connected
  #selector

  get animation() {
    return this.#animation
  }

  constructor({elementEventMap, selector, connected, select}) {
    this.#elementEventMap = elementEventMap
    this.#connected = connected
    this.#selector = selector
    this.select = select
  }

  select() {}

  get() {
    return this.select()
  }

  on(eventName, listener) {
    applyOnEachElementFrom(
      this.select(),
      el => {
        const eventListenerMap = this.#elementEventMap.getOrSet(el, new ExtendedMap())
        const listeners = eventListenerMap.getOrSet(eventName, new Set())

        listeners.add(listener)

        if (this.#connected) bindTo(el, eventName, listener)
      },
      elementNotFound(this.#selector),
    )

    return this
  }

  off(eventName, listener) { //TODO: trofima: off all
    applyOnEachElementFrom(
      this.select(),
      el => {
        const eventListenerMap = this.#elementEventMap.get(el)
        const listeners = eventListenerMap.get(eventName)

        listeners.delete(listener)

        if (this.#connected) unbindFrom(el, eventName, listener)
      },
      elementNotFound(this.#selector),
    )

    return this
  }

  clear() {
    this.get().innerHTML = ''

    return this
  }

  append(...args) {
    this.get().append(...args)

    return this
  }

  prepend(...args) {
    this.get().prepend(...args)

    return this
  }

  replace(...args) {
    this.clear().append(...args)

    return this
  }

  remove(...args) {
    this.get()?.remove(...args)

    return this
  }

  attach(html) {
    this.append(createNodeFrom(html))

    return this
  }

  pretach(html) {
    this.prepend(createNodeFrom(html))

    return this
  }

  reattach(html) {
    this.replace(createNodeFrom(html))

    return this
  }

  style(styles) {
    this.get().style.cssText = Object.keys(styles).reduce((acc, prop) => `${acc} ${prop}: ${styles[prop]};`, ``)

    return this
  }

  animate(...args) {
    this.#animation = this.get().animate(...args)

    return this.#animation.finished
  }

  async transit({from, to}, options) {
    if (from) await this.animate([from, to], options)
    
    this.style(to) //TODO: use animation.commitStyles()
  }
}

class ElementWrapper extends BaseElementWrapper {
  #rootEl
  #selector

  constructor({elementEventMap, rootEl, selector, connected}) {
    super({
      elementEventMap, connected, selector,
      select: () => selector ? rootEl.querySelector(selector) : rootEl,
    })
    this.#rootEl = rootEl
    this.#selector = selector
  }

  all() {
    this.select = () => this.#rootEl.querySelectorAll(this.#selector)
    return this
  }

  at(index) {
    this.select = () => this.#rootEl.querySelectorAll(this.#selector)[index]
    return this
  }

  reduce(cb, defaultAcc) {
    const elements = this.all().get()
    let acc = defaultAcc ?? elements[0]

    elements.forEach((el, i) => acc = cb(acc, el, i))

    return acc
  }
}

class GlobalElementWrapper extends BaseElementWrapper {
  constructor({el, elementEventMap, connected}) {
    super({elementEventMap, connected, selector: 'global object', select: () => el})
  }
}

export default class Component extends HTMLElement {
  #elementEventMap = new ExtendedMap()

  /** https://developers.google.com/web/fundamentals/architecture/building-components/customelements#attrchanges */
  static get observedAttributes() {
    return []
  }

  static get componentName() {
    return pascalToDashCase(this.name || this.__proto__.name) // __proto__ - is the Safari hack
  }

  /** https://developers.google.com/web/fundamentals/architecture/building-components/customelements#reactions */
  /** https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance */
  constructor() {
    /**
     * An instance of the element is created or upgraded.
     * Useful for initializing state, settings up event listeners,
     * or creating shadow dom.
     * */
    super()

    this.attachShadow({mode: 'open'})
  }

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
    const changeListener = this.attributeChangeListeners()[attrName]

    if (changeListener)
      changeListener(newVal, oldVal)
  }

  adoptedCallback() {
    /**
     * The custom element has been moved into a new document
     * (e.g. someone called document.adoptNode(el)).
     * */

    this.onAdopted()
  }

  render() {
    return ''
  }

  onConnected() {
    this.attach(this.render())
  }

  onDisconnected() {
    this.#elementEventMap = new ExtendedMap()
    this.shadowRoot.innerHTML = ''
  }

  onAdopted() {

  }

  attributeChangeListeners() {
    return {}
  }

  attach(html) {
    const tpl = document.createElement('template')

    tpl.innerHTML = html
    this.#applyShadyCss(tpl)
    this.shadowRoot.appendChild(tpl.content.cloneNode(true))
  }

  host(selector) {  //TODO: bad name. it returns reference to the selected element and not the element itself
    return new ElementWrapper({
      rootEl: this.shadowRoot,
      elementEventMap: this.#elementEventMap,
      connected: this.isConnected,
      selector,
    })
  }

  element(selector) {  //TODO: bad name. it returns reference to the selected element and not the element itself
    return new ElementWrapper({
      rootEl: this,
      elementEventMap: this.#elementEventMap,
      connected: this.isConnected,
      selector,
    })
  }

  document() { //TODO trofima: extract to service
    return new GlobalElementWrapper({
      el: document,
      elementEventMap: this.#elementEventMap,
      connected: this.isConnected,
    })
  }

  async getChildren(Type) {
    if (Type) {
      await whenDefined(Type)

      return Array.from(this.children).filter(node => node instanceof Type)
    }
    
    return Array.from(this.children)
  }

  async getFromSlot(selector, Type) {
    if (this.isConnected) {
      await whenDefined(Type)

      return this.shadowRoot
        .querySelector(selector)
        .assignedNodes()
        .filter(node => node instanceof Type)
    }

    return []
  }

  #applyShadyCss = (tpl) => {
    if (window.ShadyCSS) { //if browser doesn't support style scoping in shadow dom
      ShadyCSS.prepareTemplate(tpl, this.constructor.componentName)
      ShadyCSS.styleElement(this)
    }
  }
}
