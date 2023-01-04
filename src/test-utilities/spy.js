import {Deferred} from '../utilities'

class ExtensibleFunction extends Function {
  constructor(func) {
    return Object.setPrototypeOf(func, new.target.prototype)
  }
}

class FunctionSpyContext {
  callArguments = []
  callCount = 0
  defaultReturn = undefined
  defaultError = undefined

  addCall(args) {
    this.callCount++
    this.callArguments.push(args)
  }
}

class AsyncFunctionSpyContext extends FunctionSpyContext {
  deferred = false
  deferredCalls = []
}

class BaseFunctionSpy extends ExtensibleFunction {
  constructor(spy, context) {
    super(spy)

    this.#context = context
  }

  get called() {return Boolean(this.#context.callCount)}
  get callCount() {return this.#context.callCount}

  returns(value) {
    this.#context.defaultReturn = value
    return this
  }

  fails(error) {
    this.#context.defaultError = error
    return this
  }

  argumentsAt(index) {
    return this.#context.callArguments[index]
  }

  #context
}
export class FunctionSpy extends BaseFunctionSpy {
  constructor(fn) {
    const context = new FunctionSpyContext()

    function spy(...args) {
      context.addCall(args)

      if (context.defaultError)
        throw context.defaultError
      fn?.(...args)
      return context.defaultReturn
    }

    super(spy, context)
  }
}

export class AsyncFunctionSpy extends BaseFunctionSpy {
  constructor(fn) {
    const context = new AsyncFunctionSpyContext()

    function spy(...args) {
      context.addCall(args)
      const deferred = new Deferred()
      if (context.deferred)
        context.deferredCalls.push(deferred)
      else if (context.defaultError)
        deferred.reject(context.defaultError)
      else
        deferred.resolve(context.defaultReturn)
      return fn ? deferred.promise.then(() => fn(...args)) : deferred.promise
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
