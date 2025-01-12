export class Atom {
  static of(initialValue, {keepHistory = false} = {}) {
    return new Atom(initialValue, {keepHistory})
  }

  static update(atom, update, ...updates) { //TODO: test
    assertAtom(atom, 'Atom.update can update only atoms')
    return atom.update(update, ...updates)
  }

  static get(atom, index) {  //TODO: test
    assertAtom(atom, 'Atom.get can get value only from atoms')
    return atom.get(index)
  }

  static subscribe(atom, subscriber) { //TODO: test
    assertAtom(atom, 'Atom.subscribe can subscribe only to atoms')
    return atom.subscribe(subscriber)
  }

  static unsubscribe(atom, subscriber) { //TODO: test
    assertAtom(atom, 'Atom.unsubscribe can unsubscribe only from atoms')
    return atom.unsubscribe(subscriber)
  }

  constructor(initialValue = {}, {keepHistory = false} = {}) {
    if (initialValue.constructor === Object) {
      this.#value = Object.freeze(initialValue)
      this.#keepHistory = keepHistory
    } else
      console.warn(`${initialValue.constructor} type is not supported yet`)
  }

  // TODO: init, when keeps history, can't be reinited, also add static
  // TODO: reset, when does not keep history, can't be reset, also add static

  update = (applyChanges, ...changes) => {
    const currentValue = this.get()
    if (this.#keepHistory) this.#updates.push([applyChanges, changes])
    else this.#value = Object.freeze(applyChanges(this.#value, ...changes))
    const value = this.get()
    for (const subscriber of this.#subscribers) subscriber(value, currentValue)
    return value
  }

  get = (index) => this.#keepHistory
    ? this.#updates
        .slice(0, index)
        .reduce((acc, [applyChanges, changes]) => applyChanges(acc, ...changes), this.#value)
    : this.#value

  subscribe = (subscriber) => {
    this.#subscribers.add(subscriber)
    return () => this.unsubscribe(subscriber)
  }

  unsubscribe = (subscriber) => {
    this.#subscribers.delete(subscriber)
  }

  #value
  #keepHistory = false
  #updates = []
  #subscribers = new Set()
}

const assertAtom = (maybeAtom, errorDescription) => {
  if (!(maybeAtom instanceof Atom))
    throw new Error(`${errorDescription}. Got '${maybeAtom.constructor.name}' instead`)
}