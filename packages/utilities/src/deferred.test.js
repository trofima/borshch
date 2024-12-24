import {assert} from 'chai'
import {Deferred} from './deferred.js'

suite('Deferred', () => {
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