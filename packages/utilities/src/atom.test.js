import {assert} from 'chai'
import {Atom} from './atom.js'
import {FunctionSpy} from './spy.js'

suite('Atom', () => {
  test('updating state', async () => {
    const atom = Atom.of()

    assert.deepEqual(atom.get(), {})

    const state1 = atom.update(() => ({prop: 'value'}))
    assert.deepEqual(state1, {prop: 'value'})
    assert.deepEqual(atom.get(), {prop: 'value'})

    const state2 = atom.update((model) => ({...model, prop: 'another value', anotherProp: 'value'}))
    assert.deepEqual(state2, {prop: 'another value', anotherProp: 'value'})
    assert.deepEqual(atom.get(), {prop: 'another value', anotherProp: 'value'})
  })

  test('update state with updater and updates', () => {
    const atom = Atom.of({prop: 'value', anotherProp: 'another value'})
    const merge = (model, updates) => ({...model, ...updates})

    const state = atom.update(merge, {anotherProp: 'updated another value'})

    assert.deepEqual(state, {prop: 'value', anotherProp: 'updated another value'})
    assert.deepEqual(atom.get(), {prop: 'value', anotherProp: 'updated another value'})
  })

  test('update state with updater and multiple updates', () => {
    const atom = Atom.of({prop: 'value', anotherProp: 'another value'})
    const assign = (model, prop, value) => ({...model, [prop]: value})

    const state = atom.update(assign, 'prop', 'updated value')

    assert.deepEqual(state, {prop: 'updated value', anotherProp: 'another value'})
    assert.deepEqual(atom.get(), {prop: 'updated value', anotherProp: 'another value'})
  })

  test('updating state with history', async () => {
    const atom = Atom.of({}, {keepHistory: true})

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
  })

  test('subscription', () => {
    const atom = Atom.of({}, {keepHistory: true})
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
    const atom = Atom.of({}, {keepHistory: true})

    assert.throws(() => atom.update((model) => (model.prop = 'value')), TypeError)
  })
})