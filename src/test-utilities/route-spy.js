import {ElementSpy, FunctionSpy} from '.'

export default class RouteSpy extends ElementSpy {
  constructor({path, transition} = {}) {
    super({transition})
    this.#path = path
  }

  get path() {return this.#path}
  get rendered() {return this.#rendered}

  render = new FunctionSpy(() => this.#rendered = true)
  clear = new FunctionSpy(() => this.#rendered = false)

  #path
  #rendered = false
}
