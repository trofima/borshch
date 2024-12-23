import {assert} from 'chai'
import {Deferred} from './deferred.js'

suite('Deferred', () => {
  test('state change', async () => {
    const deferred = new Deferred()
    assert.equal(deferred.state, 'pending')

    await deferred.resolve()
    assert.equal(deferred.state, 'resolved')

    const anotherDeferred = new Deferred()
    assert.equal(anotherDeferred.state, 'pending')

    await anotherDeferred.reject().catch()
    assert.equal(anotherDeferred.state, 'rejected')
  })

  test('throws when promise already fulfilled', async () => {
    const deferred = new Deferred()
    await deferred.resolve()
    assert.throws(() => deferred.resolve(), Error, 'Promise already resolved')
    assert.throws(() => deferred.reject(), Error, 'Promise already resolved')

    const anotherDeferred = new Deferred()
    await anotherDeferred.reject().catch()
    assert.throws(() => anotherDeferred.resolve(), Error, 'Promise already rejected')
    assert.throws(() => anotherDeferred.reject(), Error, 'Promise already rejected')
  })

  test('promise resolution', async () => {
    const deferred = new Deferred()
    deferred.resolve('result')
    const result = await deferred.promise
    assert.deepEqual(result, 'result')

    const anotherDeferred = new Deferred()
    anotherDeferred.resolve({another: 'result'})
    const anotherResult = await anotherDeferred.promise
    assert.deepEqual(anotherResult, {another: 'result'})
  })

  test('promise rejection', async () => {
    const deferred = new Deferred()
    const promiseError = new Error('oj-vej')
    deferred.reject(promiseError)
    try {
      await deferred.promise
    } catch(error) {
      assert.equal(error, promiseError)
    }

    const anotherDeferred = new Deferred()
    const anotherPromiseError = new Error('oj-vavoj')
    anotherDeferred.reject(anotherPromiseError)
    try {
      await anotherDeferred.promise
    } catch(error) {
      assert.equal(error, anotherPromiseError)
    }
  })
})