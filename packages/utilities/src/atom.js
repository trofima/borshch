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
    this.init(initialValue)
    if (withHistory) this.#initHistory()
  }

  init(initialValue) {
    if (this.#initialValue !== undefined) throw new Error('Atom.init: atom value is already initialized')
    this.#value = Object.freeze(initialValue)
    this.#initialValue = Object.freeze(initialValue)
    return this.get()
  }

  reset() {
    this.#value = this.#initialValue
    if (this.#history) this.#initHistory()
    return this.get()
  }

  update = (applyChanges, ...changes) => {
    const currentValue = this.get()
    if (this.#history) this.#history.addEntry([applyChanges, changes])
    else this.#value = Object.freeze(applyChanges(this.#value, ...changes))
    const value = this.get()
    for (const subscriber of this.#subscribers) subscriber(value, currentValue)
    return value
  }

  undo = () => {
    this.#history.back()
    return this.get(this.#history.getCurrentIndex())
  }

  get = (index) => this.#history
    ? this.#applyUpdates(index ?? this.#history.getCurrentIndex())
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
  #history
  #subscribers = new Set()

  #initHistory() {
    this.#history = new History({updates: [[() => this.#initialValue, [undefined]]]})
  }

  #applyUpdates = (index) => {
    if (!this.#history.hasEntryAt(index)) throw new Error(`Atom.get: history entry at index ${index} does not exist`)
    return this.#history
      .getEntries(0, index + 1)
      .reduce((acc, [applyChanges, changes]) => applyChanges(acc, ...changes), undefined)
  }
}

const assertAtom = (maybeAtom, errorDescription) => {
  if (!(maybeAtom instanceof Atom))
    throw new Error(`${errorDescription}. Got '${maybeAtom.constructor.name}' instead`)
}

class History {
  constructor({
    updates = [],
    currentIndex = 0,
  } = {}){
    this.#updates = updates
    this.#currentIndex = currentIndex
  }

  getCurrentIndex() {
    return this.#currentIndex
  }

  getEntries(from, to) {
    return this.#updates.slice(from, to)
  }

  hasEntryAt(index) {
    return index in this.#updates
  }

  addEntry(entry) {
    this.#updates.push(entry)
    this.#currentIndex ++
  }

  back() {
    this.#currentIndex --
  }

  #updates
  #currentIndex = -1
}
