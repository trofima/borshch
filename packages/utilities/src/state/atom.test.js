import {assert} from 'chai'
import {Atom} from './atom.js'
import {FunctionSpy} from '../test/spy.js'

suite('Atom', () => {
  suite('initialization', () => {
    test('initialize state', async () => {
      const atom1 = new Atom()
      const state1 = atom1.init()
      assert.deepEqual(state1, undefined)
      assert.deepEqual(atom1.get(), undefined)

      const atom2 = new Atom()
      const state2 = atom2.init('initial value')
      assert.deepEqual(state2, 'initial value')
      assert.deepEqual(atom2.get(), 'initial value')

      const atom3 = new Atom()
      const state3 = atom3.init({prop: 'initial value'})
      assert.deepEqual(state3, {prop: 'initial value'})
      assert.deepEqual(atom3.get(), {prop: 'initial value'})
    })

    test('forbids reinitializing state', () => {
      const atom1 = new Atom()
      atom1.init('initial value')
      assert.throws(() => atom1.init(), Error, 'Atom.init: atom value is already initialized')

      const atom2 = new Atom('initial value')
      assert.throws(() => atom2.init(), Error, 'Atom.init: atom value is already initialized')
    })
  })

  suite('getting state', () => {
    test('get state', async () => {
      const atom = new Atom()
      atom.init('initial value')

      assert.deepEqual(atom.get(), 'initial value')

      atom.update(() => 'updated value')

      assert.deepEqual(atom.get(), 'updated value')
    })

    test('get value from state using a selector function', async () => {
      const atom = new Atom('value')
      const getLength = (value) => value.length
      const getFirstChar = (value) => value[0]

      assert.deepEqual(atom.get(), 'value')
      assert.deepEqual(atom.get(getLength), 5)
      assert.deepEqual(atom.get(getFirstChar), 'v')
    })

    test('get value from state using a selector function when history is enabled', async () => {
      const atom = new Atom('value', {withHistory: true})
      const getLength = (value) => value.length
      const getFirstChar = (value) => value[0]

      assert.deepEqual(atom.get(), 'value')
      assert.deepEqual(atom.get(getLength), 5)
      assert.deepEqual(atom.get(getFirstChar), 'v')
    })

    test('get state by index', async () => {
      const atom = new Atom('initial value', {withHistory: true})
      atom.update(() => 'value 1')
      atom.update(() => 'value 2')

      assert.deepEqual(atom.at(0), 'initial value')
      assert.deepEqual(atom.at(1), 'value 1')
      assert.deepEqual(atom.at(2), 'value 2')
    })

    test('throw error on getting state by index without history', async () => {
      const atom = new Atom('initial value')

      assert.throws(() => atom.at(0), Error, 'Atom.at: history is not enabled')
    })
  })

  suite('updating state', () => {
    test('update state', async () => {
      const atom = new Atom()

      const state1 = atom.update(() => 1)
      assert.deepEqual(state1, 1)
      assert.deepEqual(atom.get(), 1)

      const state2 = atom.update((value) => value + 1)
      assert.deepEqual(state2, 2)
      assert.deepEqual(atom.get(), 2)
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

    test('forbids state mutation (by reference)', () => {
      const atom = new Atom({prop: 'initial value'}, {withHistory: true})

      assert.throws(() => atom.update((model) => (model.prop = 'value')), TypeError)
    })
  })

  suite('resetting state', () => {
    test('reset state to initial value', async () => {
      const atom1 = new Atom()
      atom1.init('initial value')
      atom1.update(() => 'updated value')
      const state1 = atom1.reset()
      assert.deepEqual(state1, 'initial value')
      assert.deepEqual(atom1.get(), 'initial value')

      const atom2 = new Atom()
      atom2.init(1)
      atom2.update(() => 2)
      const state2 = atom2.reset()
      assert.deepEqual(state2, 1)
      assert.deepEqual(atom2.get(), 1)
    })
  })

  suite('subscription', () => {
    test('value update subscription', () => {
      const atom = new Atom('initial value', {withHistory: true})
      const subscriber1 = new FunctionSpy()
      const subscriber2 = new FunctionSpy()

      atom.subscribe(subscriber1)
      const unsubscribe2 = atom.subscribe(subscriber2)

      atom.update(() => 'updated value')
      assert.deepEqual(subscriber1.lastCall, ['updated value', 'initial value'])
      assert.deepEqual(subscriber2.lastCall, ['updated value', 'initial value'])

      atom.update(() => 'another updated value')
      assert.deepEqual(subscriber1.lastCall, ['another updated value', 'updated value'])
      assert.deepEqual(subscriber2.lastCall, ['another updated value', 'updated value'])

      atom.unsubscribe(subscriber1)
      unsubscribe2()

      atom.update(() => 'irrelevant value')
      assert.equal(subscriber1.callCount, 2)
      assert.equal(subscriber2.callCount, 2)
    })

    test('undo/redo subscription', () => {
      const atom = new Atom('initial value', {withHistory: true})
      const subscriber = new FunctionSpy()
      atom.update(() => 'updated value')

      atom.subscribe(subscriber)

      atom.undo()
      assert.deepEqual(subscriber.lastCall, ['initial value', 'updated value'])

      atom.redo()
      assert.deepEqual(subscriber.lastCall, ['updated value', 'initial value'])
    })
  })

  suite('history', () => {
    test('update state with history', async () => {
      const atom = new Atom('initial value', {withHistory: true})

      const state1 = atom.update(() => 'value')
      const state2 = atom.update(() => 'updated value')

      assert.deepEqual(atom.at(0), 'initial value')

      assert.deepEqual(atom.at(1), 'value')
      assert.deepEqual(state1, 'value')

      assert.deepEqual(atom.at(2), 'updated value')
      assert.deepEqual(state2, 'updated value')
      assert.deepEqual(atom.at(), 'updated value')

      assert.throw(() => atom.at(4), Error, 'Atom.get: history entry at index 4 does not exist')
      assert.throw(() => atom.at(5), Error, 'Atom.get: history entry at index 5 does not exist')
    })

    test('clear history on atom reset', async () => {
      const atom = new Atom(undefined, {withHistory: true})
      atom.init('initial value')
      atom.update(() => 'value')

      atom.reset()

      assert.throw(() => atom.at(1), Error, 'Atom.get: history entry at index 1 does not exist')
    })

    test('undo state update', async () => {
      const atom = new Atom('initial value', { withHistory: true })
      atom.update(() => 'value 1')
      atom.update(() => 'value 2')

      const prevState1 = atom.undo()
      assert.deepEqual(prevState1, 'value 1')
      assert.deepEqual(atom.get(), 'value 1')

      const prevState2 = atom.undo()
      assert.deepEqual(prevState2, 'initial value')
      assert.deepEqual(atom.get(), 'initial value')
    })

    test('preserve history after undo', async () => {
      const atom = new Atom('initial value', { withHistory: true })
      atom.update(() => 'value 1')
      atom.update(() => 'value 2')

      atom.undo()
      atom.undo()

      assert.deepEqual(atom.at(1), 'value 1')
      assert.deepEqual(atom.at(2), 'value 2')
    })

    test('update resets further history', () => {
      const atom = new Atom('initial value', { withHistory: true })
      atom.update(() => 'value 1')
      atom.undo()
      atom.update(() => 'history truncating value')

      assert.deepEqual(atom.get(), 'history truncating value')

      atom.undo()

      assert.deepEqual(atom.at(1), 'history truncating value')
      assert.throws(() => atom.at(2), Error, 'Atom.get: history entry at index 2 does not exist')
    })

    test('throw error on undo without history', async () => {
      const atom = new Atom('initial value')

      assert.throws(() => atom.undo(), Error, 'Atom.undo: history is not enabled')
    })

    test('throw error, when there is no more changes to undo', async () => {
      const atom = new Atom('initial value', { withHistory: true })

      assert.throws(() => atom.undo(), Error, 'Atom.undo: no more changes to undo')

      atom.update(() => 'value 1')
      atom.undo()

      assert.throws(() => atom.undo(), Error, 'Atom.undo: no more changes to undo')
    })

    test('redo state update', async () => {
      const atom = new Atom('initial value', { withHistory: true })
      atom.update(() => 'value 1')
      atom.update(() => 'value 2')
      atom.undo()
      atom.undo()

      const redoneState1 = atom.redo()
      assert.deepEqual(redoneState1, 'value 1')
      assert.deepEqual(atom.get(), 'value 1')

      const redoneState2 = atom.redo()
      assert.deepEqual(redoneState2, 'value 2')
      assert.deepEqual(atom.get(), 'value 2')
    })

    test('throw error on redo without history', async () => {
      const atom = new Atom('initial value')

      assert.throws(() => atom.redo(), Error, 'Atom.redo: history is not enabled')
    })

    test('throw error, when there is no more changes to redo', async () => {
      const atom = new Atom('initial value', { withHistory: true })

      assert.throws(() => atom.redo(), Error, 'Atom.redo: no more changes to redo')

      atom.update(() => 'value 1')
      atom.undo()
      atom.redo()

      assert.throws(() => atom.redo(), Error, 'Atom.redo: no more changes to redo')
    })

    test('resets redo history on new update after undo', async () => {
      const atom = new Atom('initial value', { withHistory: true })
      atom.update(() => 'value 1')
      atom.undo()

      atom.update(() => 'history truncating value')

      assert.throws(() => atom.redo(), Error, 'Atom.redo: no more changes to redo')
    })
  })

  suite('static interface', () => {
    test('static interface usage', async () => {
      const atom = Atom.of(undefined, {withHistory: true})

      const initResult = Atom.init(atom, {prop: 'initial value'})
      assert.throw(() => Atom.init([]), 'Atom.init can init only atoms. Got \'Array\' instead')
      assert.deepEqual(initResult, {prop: 'initial value'})
      assert.deepEqual(atom.get(), {prop: 'initial value'})

      const updateResult = Atom.update(atom, () => ({prop: 'value'}))
      assert.throw(() => Atom.update(1), 'Atom.update can update only atoms. Got \'Number\' instead')
      assert.deepEqual(updateResult, {prop: 'value'})
      assert.deepEqual(atom.get(), {prop: 'value'})

      const undoResult = Atom.undo(atom)
      assert.throw(() => Atom.undo(1), 'Atom.undo can undo only atoms. Got \'Number\' instead')
      assert.deepEqual(undoResult, {prop: 'initial value'})
      assert.deepEqual(atom.get(), {prop: 'initial value'})

      const redoResult = Atom.redo(atom)
      assert.throw(() => Atom.redo(1), 'Atom.redo can redo only atoms. Got \'Number\' instead')
      assert.deepEqual(redoResult, {prop: 'value'})
      assert.deepEqual(atom.get(), {prop: 'value'})

      assert.throw(() => Atom.get(''), 'Atom.get can get value only from atoms. Got \'String\' instead')
      assert.deepEqual(Atom.get(atom), {prop: 'value'})
      assert.deepEqual(Atom.get(atom, (value) => value.prop), 'value')
      assert.throw(() => Atom.at('', 0), 'Atom.at can get value by index only from atoms. Got \'String\' instead')
      assert.deepEqual(Atom.at(atom, 0), {prop: 'initial value'})

      const subscriber1 = new FunctionSpy()
      const subscriber2 = new FunctionSpy()
      const unsubscribe1 = Atom.subscribe(atom, subscriber1)
      Atom.subscribe(atom, subscriber2)
      atom.update(() => ({prop: 'another value'}))
      unsubscribe1()
      Atom.unsubscribe(atom, subscriber2)
      atom.update(() => ({irrelevant: 'irrelevant'}))
      assert.throw(() => Atom.subscribe({}), 'subscribe can subscribe only to atoms. Got \'Object\' instead')
      assert.throw(() => Atom.unsubscribe({}), 'Atom.unsubscribe can unsubscribe only from atoms. Got \'Object\' instead')
      assert.deepEqual(subscriber1.lastCall, [{prop: 'another value'}, {prop: 'value'}])
      assert.deepEqual(subscriber2.lastCall, [{prop: 'another value'}, {prop: 'value'}])
    })
  })

  // TODO: usage example for entity
})