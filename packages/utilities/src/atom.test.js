import {assert} from 'chai'
import {Atom} from './atom.js'
import {FunctionSpy} from './spy.js'

suite('Atom', () => {
  test('update state', async () => {
    const atom = new Atom()

    assert.deepEqual(atom.get(), undefined)

    const state1 = atom.update(() => ({prop: 'value'}))
    assert.deepEqual(state1, {prop: 'value'})
    assert.deepEqual(atom.get(), {prop: 'value'})

    const state2 = atom.update((model) => ({...model, prop: 'another value', anotherProp: 'value'}))
    assert.deepEqual(state2, {prop: 'another value', anotherProp: 'value'})
    assert.deepEqual(atom.get(), {prop: 'another value', anotherProp: 'value'})
  })

  test('update state with updater and updates', () => {
    const atom = new Atom({prop: 'value', anotherProp: 'another value'})
    const merge = (model, updates) => ({...model, ...updates})

    const state = atom.update(merge, {anotherProp: 'updated another value'})

    assert.deepEqual(state, {prop: 'value', anotherProp: 'updated another value'})
    assert.deepEqual(atom.get(), {prop: 'value', anotherProp: 'updated another value'})
  })

  test('update state with updater and multiple updates', () => {
    const atom = new Atom({prop: 'value', anotherProp: 'another value'})
    const assign = (model, prop, value) => ({...model, [prop]: value})

    const state = atom.update(assign, 'prop', 'updated value')

    assert.deepEqual(state, {prop: 'updated value', anotherProp: 'another value'})
    assert.deepEqual(atom.get(), {prop: 'updated value', anotherProp: 'another value'})
  })

  test('update state with history', async () => {
    const atom = new Atom({}, {keepHistory: true})

    const state1 = atom.update(() => ({prop: 'value'}))
    const state2 = atom.update((model, updates) => ({...model, ...updates}), {prop: 'another value'})
    const state3 = atom.update((_model, updates) => ({...updates}), {anotherProp: 'value'})

    assert.deepEqual(atom.get(0), {})
    assert.deepEqual(atom.get(1), {prop: 'value'})
    assert.deepEqual(state1, {prop: 'value'})
    assert.deepEqual(atom.get(2), {prop: 'another value'})
    assert.deepEqual(state2, {prop: 'another value'})
    assert.deepEqual(atom.get(3), {anotherProp: 'value'})
    assert.deepEqual(state3, {anotherProp: 'value'})
    assert.deepEqual(atom.get(), {anotherProp: 'value'})
    assert.throw(() => atom.get(4), Error, 'Atom.get: history entry at index 4 does not exist')
    assert.throw(() => atom.get(5), Error, 'Atom.get: history entry at index 5 does not exist')
  })

  test('subscription', () => {
    const atom = new Atom({}, {keepHistory: true})
    const subscriber1 = new FunctionSpy()
    const subscriber2 = new FunctionSpy()

    atom.subscribe(subscriber1)
    const unsubscribe2 = atom.subscribe(subscriber2)

    atom.update(() => ({prop: 'value'}))
    assert.deepEqual(subscriber1.lastCall, [{prop: 'value'}, {}])
    assert.deepEqual(subscriber2.lastCall, [{prop: 'value'}, {}])

    atom.update(() => ({anotherProp: 'another value'}))
    assert.deepEqual(subscriber1.lastCall, [{anotherProp: 'another value'}, {prop: 'value'}])
    assert.deepEqual(subscriber2.lastCall, [{anotherProp: 'another value'}, {prop: 'value'}])

    atom.unsubscribe(subscriber1)
    unsubscribe2()

    atom.update(() => ({irrelevant: 'irrelevant'}))
    assert.equal(subscriber1.callCount, 2)
    assert.equal(subscriber2.callCount, 2)
  })

  test('forbids state mutation', () => {
    const atom = new Atom({}, {keepHistory: true})

    assert.throws(() => atom.update((model) => (model.prop = 'value')), TypeError)
  })

  test('initialize state', async () => {
    const atom1 = new Atom()
    const state1 = atom1.init()
    assert.deepEqual(state1, {})
    assert.deepEqual(atom1.get(), {})

    const atom2 = new Atom()
    const state2 = atom2.init({prop: 'value'})
    assert.deepEqual(state2, {prop: 'value'})
    assert.deepEqual(atom2.get(), {prop: 'value'})

    const atom3 = new Atom()
    const state3 = atom3.init({prop: 'value', anotherProp: 'another value'})
    assert.deepEqual(state3, {prop: 'value', anotherProp: 'another value'})
    assert.deepEqual(atom3.get(), {prop: 'value', anotherProp: 'another value'})
  })

  test('forbids reinitializing state', () => {
    const atom1 = new Atom()
    atom1.init({prop: 'value'})
    assert.throws(() => atom1.init(), Error, 'Atom.init: atom value is already initialized')

    const atom2 = new Atom({prop: 'value'})
    assert.throws(() => atom2.init(), Error, 'Atom.init: atom value is already initialized')
  })

  test('reset state to initial value', async () => {
    const atom1 = new Atom()
    atom1.init({prop: 'initial value'})
    atom1.update(() => ({prop: 'value'}))
    const state1 = atom1.reset()
    assert.deepEqual(state1, {prop: 'initial value'})
    assert.deepEqual(atom1.get(), {prop: 'initial value'})

    const atom2 = new Atom()
    atom2.init({prop: 'another initial value'})
    atom2.update(() => ({prop: 'another value'}))
    const state2 = atom2.reset()
    assert.deepEqual(state2, {prop: 'another initial value'})
    assert.deepEqual(atom2.get(), {prop: 'another initial value'})

    const atom3 = new Atom(undefined, {keepHistory: true})
    atom3.init({prop: 'initial value'})
    atom3.update(() => ({prop: 'value'}))
    const state3 = atom3.reset()
    assert.deepEqual(state3, {prop: 'initial value'})
    assert.deepEqual(atom3.get(), {prop: 'initial value'})
    assert.throw(() => atom3.get(1), Error, 'Atom.get: history entry at index 1 does not exist')
  })
})