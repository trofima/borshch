import {BorshchHtmlElement, BorshchElementOf} from './borshch-html-element.js'

export default class BorshchComponent extends BorshchElementOf(HTMLElement) {
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
    this.#host.appendChild(tpl.content.cloneNode(true))
  }

  render() {
    return ''
  }

  #host
}
