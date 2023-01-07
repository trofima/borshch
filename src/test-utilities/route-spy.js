import {ElementSpy, FunctionSpy} from '.'

export default class RouteSpy extends ElementSpy {
  constructor({path, name, description, transition} = {}) {
    super({transition})
    this.stubPath(path)
    this.stubName(name)
    this.stubDescription(description)
  }

  get path() {return this.#path}
  get name() {return this.#name}
  get description() {return this.#description}
  get rendered() {return this.#rendered}

  render = new FunctionSpy()
  clear = new FunctionSpy()

  stubPath(path) {
    this.#path = path
  }

  stubName(name) {
    this.#name = name
  }

  stubDescription(description) {
    this.#description = description
  }

  stubRendered(rendered) {
    this.#rendered = rendered
  }

  #path
  #name
  #description
  #rendered = false
}
