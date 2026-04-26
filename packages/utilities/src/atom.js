export class Atom {
  static of(initialValue, {withHistory = false} = {}) {
    return new Atom(initialValue, {withHistory})
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

  constructor(initialValue, {withHistory = false} = {}) {
    this.#initialValue = initialValue
    this.#value = Object.freeze(initialValue)
    this.#history.toggle(withHistory)
  }

  init(initialValue = {}) {
    if (this.#initialValue !== undefined) throw new Error('Atom.init: atom value is already initialized')
    this.#value = Object.freeze(initialValue)
    this.#initialValue =  Object.freeze(initialValue)
    return this.get()
  }

  reset() {
    this.#value = this.#initialValue
    this.#history.reset()
    return this.get()
  }

  update = (applyChanges, ...changes) => {
    const currentValue = this.get()
    if (this.#history.isEnabled()) this.#history.add([applyChanges, changes])
    else this.#value = Object.freeze(applyChanges(this.#value, ...changes))
    const value = this.get()
    for (const subscriber of this.#subscribers) subscriber(value, currentValue)
    return value
  }

  undo = () => {
    this.#history.back()
    return this.get(this.#history.getIndex())
  }

  get = (index) => this.#history.isEnabled()
    ? this.#applyUpdates(index ?? this.#history.getIndex())
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
  #history = new History()
  #subscribers = new Set()


  #applyUpdates = (index) => {
    if (index && this.#history.hasEntryAt(index - 1)) throw new Error(`Atom.get: history entry at index ${index} does not exist`)
    return this.#history
      .getEntries(0, index)
      .reduce((acc, [applyChanges, changes]) => applyChanges(acc, ...changes), this.#initialValue)
  }
}

const assertAtom = (maybeAtom, errorDescription) => {
  if (!(maybeAtom instanceof Atom))
    throw new Error(`${errorDescription}. Got '${maybeAtom.constructor.name}' instead`)
}

class History {
  constructor({
    enabled = false,
    updates = [],
    index = -1,
  } = {}){
    this.#enabled = enabled
    this.#updates = updates
    this.#index = index
  }

  toggle(enabled) {
    this.#enabled = enabled
  }

  isEnabled() {
    return this.#enabled
  }

  hasEntryAt(index) {
    return index in this.#updates
  }

  add(entry) {
    this.#index ++
    return this.#updates.push(entry)
  }

  reset() {
    this.#index = -1
    this.#updates = []
  }

  back() {
    this.#index --
  }

  getIndex() {
    return this.#index
  }

  getEntries(from, to) {
    return this.#updates.slice(from, to)
  }

  #enabled
  #updates
  #index
}
