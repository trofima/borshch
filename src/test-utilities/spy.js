import {Deferred} from '../utilities'

export class Spy extends BaseSpy {
  constructor() {
    const context = new SpyContext()

    function spy(...args) {
      context.addCall(args)

      if (context.defaultError)
        throw context.defaultError
      return context.defaultReturn
    }

    super(spy, context)
  }
}

export class AsyncSpy extends BaseSpy {
  constructor() {
    const context = new AsyncSpyContext()

    function spy(...args) {
      context.addCall(args)

      const deferred = new Deferred()
      if (context.deferred)
        context.deferredCalls.push(deferred)
      else if (context.defaultError)
        deferred.reject(context.defaultError)
      else
        deferred.resolve(context.defaultReturn)
      return deferred.promise
    }

    super(spy, context)

    this.#context = context
  }

  defer() {
    this.#context.deferred = true
  }

  async fail(index, error) {
    const deferredFail = new Deferred()
    setImmediate(() => {
      const deferredCall = this.#context.deferredCalls[index]
      if (!deferredCall)
        throw new Error(`Function was not called at ${index}`)
      deferredCall.reject(error)
      deferredFail.resolve()
    })
    return deferredFail.promise
  }

  async succeed(index, ...args) {
    const deferredSucceed = new Deferred()
    setImmediate(() => {
      const deferredCall = this.#context.deferredCalls[index]
      if (!deferredCall)
        throw new Error(`Function was not called at ${index}`)
      deferredCall.resolve(...args)
      deferredSucceed.resolve()
    })
    return deferredSucceed.promise
  }

  #context
}

class ExtensibleFunction extends Function {
  constructor(func) {
    return Object.setPrototypeOf(func, new.target.prototype)
  }
}

class SpyContext {
  callArguments = []
  callCount = 0
  defaultReturn = undefined
  defaultError = undefined

  addCall(args) {
    this.callCount++
    this.callArguments.push(args)
  }
}

class AsyncSpyContext extends SpyContext {
  deferred = false
  deferredCalls = []
}

class BaseSpy extends ExtensibleFunction {
  constructor(spy, context) {
    super(spy)

    this.#context = context
  }

  get called() {return Boolean(this.#context.callCount)}
  get callCount() {return this.#context.callCount}

  returns(value) {
    this.#context.defaultReturn = value
  }

  fails(error) {
    this.#context.defaultError = error
  }

  argumentsAt(index) {
    return this.#context.callArguments[index]
  }

  #context
}
