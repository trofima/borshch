import {assert} from 'chai'
import {EventEmitter} from './event-emitter.js'
import {FunctionSpy} from './spy.js'

suite('EventEmitter', () => {
  suite('subscription', () => {
    test('call listeners subscribed to the event with emitted params', () => {
      const emitter = new EventEmitter()
      const listener = new FunctionSpy()

      emitter.on('event', listener)

      emitter.emit('event', 'params')
      assert.deepEqual(listener.lastCall, ['params'])

      emitter.emit('event', 'other params')
      assert.deepEqual(listener.lastCall, ['other params'])
    })

    test('call all listeners subscribed to the event', () => {
      const emitter = new EventEmitter()
      const listener1 = new FunctionSpy()
      const listener2 = new FunctionSpy()

      emitter.on('event', listener1)
      emitter.on('event', listener2)
      emitter.emit('event', 'params')

      assert.deepEqual(listener1.lastCall, ['params'])
      assert.deepEqual(listener2.lastCall, ['params'])
    })

    test('do not call listeners subscribed to other events', () => {
      const emitter = new EventEmitter()
      const listener = new FunctionSpy()
      const otherListener = new FunctionSpy()

      emitter.on('event', listener)
      emitter.on('otherEvent', otherListener)
      emitter.emit('event', 'params')

      assert.equal(listener.callCount, 1)
      assert.equal(otherListener.called, false)
    })

    test('do nothing on emit, when there are no listeners for the event', () => {
      const emitter = new EventEmitter()

      assert.doesNotThrow(() => emitter.emit('event', 'params'))
    })

    test('do not subscribe the same listener twice', () => {
      const emitter = new EventEmitter()
      const listener = new FunctionSpy()

      emitter.on('event', listener)
      emitter.on('event', listener)
      emitter.emit('event', 'params')

      assert.equal(listener.callCount, 1)
    })
  })

  suite('single time subscription', () => {
    test('call listener only once', () => {
      const emitter = new EventEmitter()
      const listener = new FunctionSpy()

      emitter.once('event', listener)
      emitter.emit('event', 'params')
      emitter.emit('event', 'other params')

      assert.equal(listener.callCount, 1)
    })
  })

  suite('unsubscription', () => {
    test('do not call listener after removal via off', () => {
      const emitter = new EventEmitter()
      const listener = new FunctionSpy()

      emitter.on('event', listener)
      emitter.off('event', listener)
      emitter.emit('event', 'params')

      assert.equal(listener.called, false)
    })

    test('do nothing, when off is called for an unknown event', () => {
      const emitter = new EventEmitter()
      const listener = new FunctionSpy()

      assert.doesNotThrow(() => emitter.off('event', listener))
    })

    test('do nothing, when off is called for a listener that is not subscribed', () => {
      const emitter = new EventEmitter()
      const notSubscribed = new FunctionSpy()

      emitter.on('event', () => {})

      assert.doesNotThrow(() => emitter.off('event', notSubscribed))
    })

    test('do not call listener after invoking the unsubscribe function returned by on', () => {
      const emitter = new EventEmitter()
      const listener = new FunctionSpy()
      const otherListener = new FunctionSpy()

      const unsubscribe = emitter.on('event', listener)
      const otherUnsubscribe = emitter.on('event', otherListener)
      unsubscribe()
      otherUnsubscribe()
      emitter.emit('event', 'params')

      assert.equal(listener.called, false)
      assert.equal(otherListener.called, false)
    })
  })
})
