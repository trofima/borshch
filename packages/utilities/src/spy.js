import hash from 'object-hash'
import {Deferred} from './src/deferred.js'

class ExtensibleFunction extends Function {
  constructor(func) {
    return Object.setPrototypeOf(func, new.target.prototype)
  }
}

class FunctionSpyContext {
  callArguments = []
  callCount = 0
  returnValue = undefined
  error = undefined
  forArgumentsToReturnValue = new Map()

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

  get calls() {return this.#context.callArguments}
  get called() {return Boolean(this.#context.callCount)}
  get callCount() {return this.#context.callCount}

  get theOnlyCall() {
    const {length} = this.#context.callArguments
    if (length === 0)
      throw new Error('Spied function has never been called')
    if (length > 1)
      throw new Error(`Spied function should have been called once. Called ${length} times instead`)
    return this.#context.callArguments.at(0)
  }

  get lastCall() {
    const {length} = this.#context.callArguments
    if (length === 0)
      throw new Error('Spied function has never been called')
    return this.#context.callArguments.at(-1)
  }

  returns(value) {
    this.#context.returnValue = value
    return this
  }

  fails(error) {
    this.#context.error = error
    return this
  }

  argumentsAt(index) {
    const args = this.#context.callArguments.at(index)
    if (!args)
      throw new Error(`Spied function has not been called${index === 0 ? '' : ` ${index + 1} times`}`)
    return args
  }

  for(...args) {
    const argumentsHash = hash(args)
    this.#context.forArgumentsToReturnValue.set(argumentsHash, undefined)
    return {
      returns: (value) => this.#context.forArgumentsToReturnValue.set(argumentsHash, value),
    }
  }

  #context
}

export class FunctionSpy extends BaseFunctionSpy {
  constructor(fake) {
    const context = new FunctionSpyContext()

    function spy(...args) {
      context.addCall(args)
      if (context.error) throw context.error
      return execute(context, args, fake)
    }

    super(spy, context)
  }
}

export class AsyncFunctionSpy extends BaseFunctionSpy {
  constructor(fake) {
    const context = new AsyncFunctionSpyContext()

    function spy(...args) {
      const deferred = new Deferred()

      context.addCall(args)
      if (context.deferred) context.deferredCalls.push(deferred)
      else if (context.error) deferred.reject(context.error)
      else deferred.resolve(execute(context, args, fake))

      return deferred.promise
    }

    super(spy, context)

    this.#context = context
  }

  defer() {
    this.#context.deferred = true
  }

  async resolve(index, value) {
    const deferredReturn = new Deferred()
    setImmediate(() => {
      const deferredCall = this.#context.deferredCalls.at(index)
      if (!deferredCall) throw new Error(`Function was not called at ${index}`)
      deferredCall.resolve(value)
      deferredReturn.resolve()
    })
    return deferredReturn.promise
  }

  async reject(index, error) {
    const deferredFail = new Deferred()
    setImmediate(() => {
      const deferredCall = this.#context.deferredCalls.at(index)
      if (!deferredCall) throw new Error(`Function was not called at ${index}`)
      deferredCall.reject(error)
      deferredFail.resolve()
    })
    return deferredFail.promise
  }

  #context
}

const execute = (context, args, fake) => {
  const fakeResult = fake?.(...args)
  return context.forArgumentsToReturnValue.get(hash(args)) ?? context.returnValue ?? fakeResult
}