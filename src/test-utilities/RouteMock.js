
import {ElementMock, AsyncOperationMock} from '.'

export default class RouteMock extends ElementMock {
  constructor({path} = {}) {
    super()
    this.#path = path
  }

  get rendered() {return this.#rendered}
  get renderOperation() {return this.#renderOperation}
  get clearOperation() {return this.#clearOperation}
  get path() {return this.#path}

  render() {
    this.#rendered = true
    this.#renderOperation.create()
  }

  clear() {
    this.#rendered = false
    this.#clearOperation.create()
  }

  #path
  #rendered = false
  #renderOperation = new AsyncOperationMock('router render')
  #clearOperation = new AsyncOperationMock('router clear')
}
