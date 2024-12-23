import {clone} from 'rambda'

// TODO: test
export class Atom {
  static of(initialValue, {keepHistory = false} = {}) {
    return new Atom(initialValue, {keepHistory})
  }

  constructor(initialValue = {}, {keepHistory = false} = {}) {
    if (initialValue === null || initialValue.constructor === Object) {
      this.#value = Object.freeze(initialValue)
      this.#keepHistory = keepHistory
    } else
      console.warn(`${initialValue.constructor} type is not supported yet`)
  }

  update = (update, updates) => {
    if (this.#keepHistory) this.#updates.push([update, updates])
    else this.#value = Object.freeze(update(clone(this.#value), updates))
    const value = this.get()
    for (const subscriber of this.#subscribers) subscriber(value)
    return value
  }

  get = (index = 0) => this.#keepHistory
    ? this.#updates.slice(index).reduce((acc, [updater, updates]) => updater(acc, updates), this.#value)
    : this.#value

  subscribe = (subscriber) => {
    this.#subscribers.add(subscriber)
    return () => this.unsubscribe(subscriber)
  }

  unsubscribe = subscriber => {
    this.#subscribers.delete(subscriber)
  }

  #value
  #keepHistory = false
  #updates = []
  #subscribers = new Set()
}