import {ElementSpy, FunctionSpy} from '.'

export default class RouteSpy extends ElementSpy {
  constructor({path, transition} = {}) {
    super({transition})
    this.#path = path
  }

  get path() {return this.#path}
  get rendered() {return this.#rendered}

  render = new FunctionSpy()
  clear = new FunctionSpy()

  stubRendered(rendered) {
    this.#rendered = rendered
  }

  #path
  #rendered = false
}
