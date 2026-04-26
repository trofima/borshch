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

  static get(atom, index) {
    assertAtom(atom, 'Atom.get can get value only from atoms')
    return atom.get(index)
  }

  static undo(atom) {
    assertAtom(atom, 'Atom.undo can undo only atoms')
    return atom.undo()
  }

  static redo(atom) {
    assertAtom(atom, 'Atom.redo can redo only atoms')
    return atom.redo()
  }

  static update(atom, update, ...updates) {
    assertAtom(atom, 'Atom.update can update only atoms')
    return atom.update(update, ...updates)
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
    this.#initialize(initialValue)
    if (withHistory) this.#initializeHistory()
  }

  init = (initialValue) => {
    if (this.#initialValue !== undefined) throw new Error('Atom.init: atom value is already initialized')
    this.#initialize(initialValue)
    return this.get()
  }

  reset = () => {
    this.#value = this.#initialValue
    if (this.#history) this.#initializeHistory()
    return this.get()
  }

  get = (index) => this.#history
    ? this.#getFromHistory(index)
    : this.#value

  update = (applyChanges, ...changes) => {
    const currentValue = this.#value
    this.#value = this.#changeValue(applyChanges, ...changes)
    for (const subscriber of this.#subscribers) subscriber(this.#value, currentValue)
    if (this.#history) this.#history = History.addEntry(this.#history, [applyChanges, changes])
    return this.#value
  }

  undo = () => {
    this.#assertHistoryEnabled('undo')
    if (!History.hasPreviousEntry(this.#history)) throw new Error('Atom.undo: no more changes to undo')
    this.#history = History.back(this.#history)
    this.#dirty = true
    return this.get()
  }

  redo = () => {
    this.#assertHistoryEnabled('redo')
    if (!History.hasNextEntry(this.#history)) throw new Error('Atom.redo: no more changes to redo')
    const [applyChanges, changes] = History.getNextEntry(this.#history)
    this.#history = History.forward(this.#history)
    this.#value = this.#changeValue(applyChanges, ...changes)
    return this.#value
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
  #dirty = false
  #subscribers = new Set()

  #initialize = (initialValue) => {
    this.#value = Object.freeze(initialValue)
    this.#initialValue = Object.freeze(initialValue)
  }

  #initializeHistory = () => {
    this.#history = History.make({entries: [[() => this.#initialValue, [undefined]]]})
  }

  #getFromHistory = (index = History.getCursor(this.#history)) => {
    if (!History.hasEntry(this.#history, index)) throw new Error(`Atom.get: history entry at index ${index} does not exist`)
    if (History.isAtCursor(this.#history, index) && !this.#dirty) return this.#value
    const value = History.getEntries(this.#history, 0, index + 1)
      .reduce((acc, [applyChanges, changes]) => applyChanges(acc, ...changes), undefined)
    const frozenValue = Object.freeze(value)
    this.#dirty = false
    if (History.isAtCursor(this.#history, index)) this.#value = frozenValue
    return frozenValue
  }

  #changeValue = (applyChanges, ...changes) => {
    return Object.freeze(applyChanges(this.#value, ...changes))
  }

  #assertHistoryEnabled = (forbiddenAction) => {
    if (!this.#history) throw new Error(`Atom.${forbiddenAction}: history is not enabled`)
  }
}

const assertAtom = (maybeAtom, errorDescription) => {
  if (!(maybeAtom instanceof Atom))
    throw new Error(`${errorDescription}. Got '${maybeAtom.constructor.name}' instead`)
}

const History = {
  make: ({entries = [], cursor = entries.length - 1} = {}) => ({entries, cursor}),
  getCursor: ({cursor}) => cursor,
  getEntries: ({entries}, from = 0, to) => entries.slice(from, to),
  getNextEntry: ({entries, cursor}) => entries.at(cursor + 1),
  hasEntry: ({entries}, index) => index in entries,
  hasPreviousEntry: ({cursor}) => cursor > 0,
  hasNextEntry: ({cursor, entries}) => cursor < entries.length - 1,
  isAtCursor: ({cursor}, index) => cursor === index,
  addEntry: ({entries, cursor, ...rest}, entry) => ({
    ...rest,
    entries: [...entries.slice(0, cursor + 1), entry],
    cursor: cursor + 1,
  }),
  back: ({cursor, ...rest}) => ({...rest, cursor: cursor - 1}),
  forward: ({cursor, ...rest}) => ({...rest, cursor: cursor + 1}),
}
