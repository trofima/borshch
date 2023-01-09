import BorshchHtmlElement, {BorshchElement} from './borshch-html-element'

export default class BorshchComponent extends BorshchElement(HTMLElement) {
  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.#host = BorshchHtmlElement.of(this.shadowRoot)
  }

  get host() {return this.#host}

  onConnected() {
    this.attach(this.render())
  }

  attach(html) {
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    this.#applyShadyCss(tpl)
    this.#host.appendChild(tpl.content.cloneNode(true))
  }

  render() {
    return ''
  }

  #applyShadyCss(tpl) {
    if (window.ShadyCSS) { //if browser doesn't support style scoping in shadow dom
      window.ShadyCSS.prepareTemplate(tpl, this.constructor.componentName)
      window.ShadyCSS.styleElement(this)
    }
  }

  #host
}
