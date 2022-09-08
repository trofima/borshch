
import {ElementMock} from '.'

export default class RouteMock extends ElementMock {
  constructor({path} = {}) {
    super()
    this.#path = path
  }

  get rendered() {return this.#rendered}
  get path() {return this.#path}

  render() {
    this.#rendered = true
  }

  clear() {
    this.#rendered = false
  }

  #path
  #rendered = false
}
