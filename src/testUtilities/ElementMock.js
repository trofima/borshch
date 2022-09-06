export default class ElementMock {
  get children() {return this.#children}
  get removed() {return this.#removed}

  replaceChildren(el) {
    this.#children = [el]
  }

  appendChild(el) {
    this.#children.push(el)
  }

  removeChild(el) {
    this.#children = this.#children.filter(child => child !== el)
  }

  #children = []
  #removed = false
}