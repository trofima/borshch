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

  init = (initialValue) => {
    if (this.#initialValue !== undefined) throw new Error('Atom.init: atom value is already initialized')
    this.#value = Object.freeze(initialValue)
    this.#initialValue = Object.freeze(initialValue)
    return this.get()
  }

  reset = () => {
    this.#value = this.#initialValue
    if (this.#history) this.#initHistory()
    return this.get()
  }

  get = (index) => this.#history
    ? this.#getFromHistory(index)
    : this.#value

  update = (applyChanges, ...changes) => {
    const currentValue = this.get()
    if (this.#history) this.#history.addEntry([applyChanges, changes])
    else this.#value = Object.freeze(applyChanges(this.#value, ...changes))
    const value = this.get()
    for (const subscriber of this.#subscribers) subscriber(value, currentValue)
    return value
  }

  undo = () => {
    this.#assertHistoryEnabled('undo')
    if (!this.#history.canGoBack()) throw new Error('Atom.undo: no more changes to undo')
    this.#history.back()
    return this.get()
  }

  redo = () => {
    this.#assertHistoryEnabled('redo')
    if (!this.#history.canGoForward()) throw new Error('Atom.redo: no more changes to redo')
    this.#history.forward()
    return this.get()
  }

  subscribe = (subscriber) => {
    this.#subscribers.add(subscriber)
    return () => this.unsubscribe(subscriber)
  }

  unsubscribe = (subscriber) => {
    this.#subscribers.delete(subscriber)
  }

  #initialValue
  #value
  #history
  #subscribers = new Set()

  #initHistory() {
    this.#history = new History({updates: [[() => this.#initialValue, [undefined]]]})
  }

  #getFromHistory = (index = this.#history.getCursor()) => {
    if (!this.#history.hasEntryAt(index)) throw new Error(`Atom.get: history entry at index ${index} does not exist`)
    return this.#history
      .getEntries(0, index + 1)
      .reduce((acc, [applyChanges, changes]) => applyChanges(acc, ...changes), undefined)
  }

  #assertHistoryEnabled(forbiddenAction) {
    if (!this.#history) throw new Error(`Atom.${forbiddenAction}: history is not enabled`)
  }
}

const assertAtom = (maybeAtom, errorDescription) => {
  if (!(maybeAtom instanceof Atom))
    throw new Error(`${errorDescription}. Got '${maybeAtom.constructor.name}' instead`)
}

class History {
  constructor({
    updates = [],
    cursor = updates.length - 1,
  } = {}){
    this.#updates = updates
    this.#cursor = cursor
  }

  getCursor() {
    return this.#cursor
  }

  getEntries(from = 0, to) {
    return this.#updates.slice(from, to)
  }

  hasEntryAt(index) {
    return index in this.#updates
  }

  canGoBack() {
    return this.#cursor > 0
  }

  canGoForward() {
    return this.#cursor < this.#updates.length - 1
  }

  addEntry(entry) {
    this.#updates = [...this.#updates.slice(0, this.#cursor + 1), entry]
    this.#cursor ++
  }

  back() {
    this.#cursor --
  }

  forward() {
    this.#cursor ++
  }

  #updates
  #cursor = -1
}
