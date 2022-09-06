import {Deferred} from '../utilities'

export default class AsyncOperationMock {
  constructor(name) {
    this.#name = name
  }

  get calls() {
    return this.#calls
  }

  get callArguments() {
    return this.#callArguments
  }

  get callCount() {
    return this.#calls.length
  }

  get name() {
    return this.#name
  }

  create(args) {
    const deferredOperation = new Deferred()

    this.#callArguments.push(args)
    this.#calls.push(deferredOperation)

    if (!this.#deferred) queueMicrotask(() => this.#error
      ? deferredOperation.reject(this.#error)
      : deferredOperation.resolve(this.#result))

    return deferredOperation.promise
  }

  reset() {
    this.#callArguments = []
    this.#calls = []
  }

  at(index) {
    return this.#calls[index]
  }

  resolveByDefault(response) {
    this.#result = response
  }

  rejectByDefault(error) {
    this.#error = error
  }

  defer() {
    this.#deferred = true
  }

  async succeed(index, value) {
    const deferredOperation = this.at(index)

    if (deferredOperation) {
      deferredOperation.resolve(value)
      return await deferredOperation.promise
    } else throw new Error(`Async ${this.name} by index ${index} not found`)
  }

  async fail(index, error) {
    const deferredOperation = this.at(index)

    if (deferredOperation) {
      deferredOperation.reject(error)
      return await deferredOperation.promise
    } else throw new Error(`Async ${this.name} by index ${index} not found`)
  }

  #name = ''
  #callArguments = []
  #calls = []
  #result = undefined
  #error = undefined
  #deferred = false
}