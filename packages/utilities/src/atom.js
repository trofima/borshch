export class Atom {
  static of(initialValue, {keepHistory = false} = {}) {
    return new Atom(initialValue, {keepHistory})
  }

  static init(atom, initialValue) {
    assertAtom(atom, 'Atom.init can init only atoms')
    return atom.init(initialValue)
  }

  static reset(atom) {
    assertAtom(atom, 'Atom.reset can reset only atoms')
    return atom.reset()
  }

  static update(atom, update, ...updates) {
    assertAtom(atom, 'Atom.update can update only atoms')
    return atom.update(update, ...updates)
  }

  static get(atom, index) {
    assertAtom(atom, 'Atom.get can get value only from atoms')
    return atom.get(index)
  }

  static subscribe(atom, subscriber) {
    assertAtom(atom, 'Atom.subscribe can subscribe only to atoms')
    return atom.subscribe(subscriber)
  }

  static unsubscribe(atom, subscriber) {
    assertAtom(atom, 'Atom.unsubscribe can unsubscribe only from atoms')
    return atom.unsubscribe(subscriber)
  }

  constructor(initialValue, {keepHistory = false} = {}) {
    this.#initialValue = initialValue
    this.#value = Object.freeze(initialValue)
    this.#keepHistory = keepHistory
  }

  init(initialValue = {}) {
    if (this.#initialValue !== undefined) throw new Error('Atom.init: atom value is already initialized')
    this.#value = Object.freeze(initialValue)
    this.#initialValue =  Object.freeze(initialValue)
    return this.get()
  }

  reset() {
    this.#value = this.#initialValue
    this.#updates = []
    return this.get()
  }

  update = (applyChanges, ...changes) => {
    const currentValue = this.get()
    if (this.#keepHistory) this.#updates.push([applyChanges, changes])
    else this.#value = Object.freeze(applyChanges(this.#value, ...changes))
    const value = this.get()
    for (const subscriber of this.#subscribers) subscriber(value, currentValue)
    return value
  }

  get = (index) => this.#keepHistory
    ? this.#applyUpdates(index)
    : this.#value

  subscribe = (subscriber) => {
    this.#subscribers.add(subscriber)
    return () => this.unsubscribe(subscriber)
  }

  unsubscribe = (subscriber) => {
    this.#subscribers.delete(subscriber)
  }

  #value
  #initialValue
  #keepHistory = false
  #updates = []
  #subscribers = new Set()

  #applyUpdates = (index) => {
    if (index > this.#updates.length) throw new Error(`Atom.get: history entry at index ${index} does not exist`)
    return this.#updates
      .slice(0, index)
      .reduce((acc, [applyChanges, changes]) => applyChanges(acc, ...changes), this.#initialValue)
  }
}

const assertAtom = (maybeAtom, errorDescription) => {
  if (!(maybeAtom instanceof Atom))
    throw new Error(`${errorDescription}. Got '${maybeAtom.constructor.name}' instead`)
}