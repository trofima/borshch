import {assert} from 'chai'
import {AsyncFunctionSpy, FunctionSpy} from './spy.js'

suite('Function Spy', () => {
  suite('sync', () => {
    test('count calls', () => {
      const fn = new FunctionSpy()
      assert.equal(fn.callCount, 0)

      fn()
      assert.equal(fn.callCount, 1)

      fn()
      assert.equal(fn.callCount, 2)
    })

    test('determine if has been called', () => {
      const fn = new FunctionSpy()
      assert.equal(fn.called, false)

      fn()
      assert.equal(fn.called, true)
    })

    test('collect call arguments', () => {
      const fn = new FunctionSpy()
      assert.deepEqual(fn.calls, [])

      fn('call1Arg1')
      assert.deepEqual(fn.calls, [['call1Arg1']])

      fn('call2Arg1', 'call1Arg2')
      assert.deepEqual(fn.calls, [['call1Arg1'], ['call2Arg1', 'call1Arg2']])
    })

    test('check that has been called only once and return the call args', () => {
      const fn = new FunctionSpy()

      assert.throws(() => fn.theOnlyCall, Error, 'Spied function has never been called')

      fn('arg1', 'arg2')
      assert.deepEqual(fn.theOnlyCall, ['arg1', 'arg2'])

      fn()
      assert.throws(() => fn.theOnlyCall, Error, 'Spied function should have been called once. Called 2 times instead')
    })

    test('get last call arguments', () => {
      const fn = new FunctionSpy()

      assert.throws(() => fn.lastCall, Error, 'Spied function has never been called')

      fn('arg1', 'arg2')
      assert.deepEqual(fn.lastCall, ['arg1', 'arg2'])
    })

    test('get arguments by index', () => {
      const fn = new FunctionSpy()

      assert.throws(() => fn.argumentsAt(2), Error, 'Spied function has not been called')

      fn('call1Arg1')
      fn('call2Arg1', 'call1Arg2')

      assert.deepEqual(fn.argumentsAt(0), ['call1Arg1'])
      assert.deepEqual(fn.argumentsAt(1), ['call2Arg1', 'call1Arg2'])

      assert.throws(() => fn.argumentsAt(2), Error, 'Spied function has not been called 3 times')
    })

    test('stub return value', () => {
      const fn = new FunctionSpy()

      fn.returns('result')
      assert.equal(fn(), 'result')

      fn.returns('another result')
      assert.equal(fn(), 'another result')
    })

    test('stub thrown error', () => {
      const fn = new FunctionSpy()

      const error = new Error('oj vej')
      fn.fails(error)
      assert.throws(() => fn(), error)

      const anotherError = new Error('oj vavoj')
      fn.fails(anotherError)
      assert.throws(() => fn(), anotherError)
    })

    test('stub return value for certain argument set', async () => {
      const fn = new FunctionSpy()
      const asyncFn = new AsyncFunctionSpy()

      fn.for('arg1').returns('result for arg1')
      fn.for('arg1', 'arg2').returns('result for arg1, arg2')
      fn.for(['array', 'argument'], {dictionary: 'argument'}).returns('result for complex arguments')

      assert.equal(fn('unknown'), undefined)
      assert.equal(fn('arg1'), 'result for arg1')
      assert.equal(fn('arg1', 'arg2'), 'result for arg1, arg2')
      assert.equal(fn(['array', 'argument'], {dictionary: 'argument'}), 'result for complex arguments')

      asyncFn.for('arg1').returns('result for arg1')
      asyncFn.for('arg1', 'arg2').returns('result for arg1, arg2')
      asyncFn.for(['array', 'argument'], {dictionary: 'argument'}).returns('result for complex arguments')

      assert.equal(await asyncFn('unknown'), undefined)
      assert.equal(await asyncFn('arg1'), 'result for arg1')
      assert.equal(await asyncFn('arg1', 'arg2'), 'result for arg1, arg2')
      assert.equal(await asyncFn(['array', 'argument'], {dictionary: 'argument'}), 'result for complex arguments')
    })

    test('stub return value for certain argument by index', async () => {
      const fn = new FunctionSpy()
      const asyncFn = new AsyncFunctionSpy()

      fn.forArg(0, 'arg1').returns('result for first arg arg1')
      fn.forArg(1, 'arg2').returns('result for second arg arg2')
      fn.forArg(0, ['complex', 'arg']).returns('result for first of complex arguments')
      fn.forArg(0, 'falsyResult').returns(null)

      assert.equal(fn('arg1', 'irrelevant'), 'result for first arg arg1')
      assert.equal(fn('irrelevant', 'arg2'), 'result for second arg arg2')
      assert.equal(fn('arg1', 'arg2'), 'result for first arg arg1')
      assert.equal(fn(['complex', 'arg'], ['irrelevant']), 'result for first of complex arguments')
      assert.equal(fn('falsyResult', 'irrelevant'), null)

      asyncFn.forArg(0, 'arg1').returns('result for first arg arg1')
      asyncFn.forArg(1, 'arg2').returns('result for second arg arg2')
      asyncFn.forArg(0, ['complex', 'arg']).returns('result for first of complex arguments')

      assert.equal(await asyncFn('arg1', 'irrelevant'), 'result for first arg arg1')
      assert.equal(await asyncFn('irrelevant', 'arg2'), 'result for second arg arg2')
      assert.equal(await asyncFn(['complex', 'arg'], ['irrelevant']), 'result for first of complex arguments')
    })

    test('fake function', () => {
      const fakeFn = new FunctionSpy()
      const fn = new FunctionSpy(fakeFn)
      fn('call1Arg1')
      fn('call2Arg1', 'call1Arg2')
      assert.deepEqual(fakeFn.calls, [
        ['call1Arg1'],
        ['call2Arg1', 'call1Arg2'],
      ])

      const anotherFakeFn = new FunctionSpy()
      const anotherFn = new FunctionSpy(anotherFakeFn)
      anotherFakeFn.returns('result')
      assert.deepEqual(anotherFn(), 'result')
      anotherFakeFn.returns('another result')
      assert.deepEqual(anotherFn(), 'another result')

      const ignoredResultFakeFn = new FunctionSpy()
      const spiedFn = new FunctionSpy(ignoredResultFakeFn)
      spiedFn.returns('overridden result')
      ignoredResultFakeFn.returns('result')
      assert.deepEqual(spiedFn(), 'overridden result')
      assert(ignoredResultFakeFn.called)
    })

    test('stub priority', async () => {
      const prioritizeFor = new FunctionSpy(() => 'fake result')
      prioritizeFor.for('arg').returns('for result')
      prioritizeFor.forArg(0, 'arg').returns('for arg result')
      prioritizeFor.returns('return result')
      assert.equal(prioritizeFor('arg'), 'for result')

      const prioritizeForArg = new FunctionSpy(() => 'fake result')
      prioritizeForArg.forArg(0, 'arg').returns('for arg result')
      prioritizeForArg.returns('return result')
      assert.equal(prioritizeForArg('arg'), 'for arg result')

      const prioritizeReturnResult = new FunctionSpy(() => 'fake result')
      prioritizeReturnResult.returns('return result')
      assert.equal(prioritizeReturnResult('arg'), 'return result')

      const prioritizeFakeResult = new FunctionSpy(() => 'fake result')
      assert.equal(prioritizeFakeResult('arg'), 'fake result')
    })
  })

  suite('async (also supports all sync)', () => {
    test('stub return value', async () => {
      const fn = new FunctionSpy()

      fn.returns('result')
      assert.equal(await fn(), 'result')

      fn.returns('another result')
      assert.equal(await fn(), 'another result')
    })

    test('stub thrown error', async () => {
      const fn = new FunctionSpy()

      const error = new Error('oj vej')
      fn.fails(error)
      assert.throws(() => fn(), error)

      const anotherError = new Error('oj vavoj')
      fn.fails(anotherError)
      assert.throws(() => fn(), anotherError)
    })

    test('defer promise resolution', async () => {
      let result0
      let result1
      const fn = new AsyncFunctionSpy()
      const execute = async () => {
        result0 = await fn()
        result1 = await fn()
      }

      fn.defer()
      execute()
      assert.equal(result0, undefined)
      assert.equal(result1, undefined)

      await fn.resolve(0, 'result 0')
      assert.equal(result0, 'result 0')
      assert.equal(result1, undefined)

      await fn.resolve(1, 'result 1')
      assert.equal(result1, 'result 1')
    })

    test('defer promise rejection', async () => {
      let error0
      let error1
      const expectedError0 = new Error('oj vej')
      const expectedError1 = new Error('oj vavoj')
      const fn = new AsyncFunctionSpy()
      const execute = async () => {
        try {
          await fn()
        } catch (error) {
          error0 = error
        }
        try {
          await fn()
        } catch (error) {
          error1 = error
        }
      }

      fn.defer()
      execute()
      assert.equal(error0, undefined)
      assert.equal(error1, undefined)

      await fn.reject(0, expectedError0)
      assert.equal(error0, expectedError0)
      assert.equal(error1, undefined)

      await fn.reject(1, expectedError1)
      assert.equal(error1, expectedError1)
    })

    test('fake function', async () => {
      const fakeFn = new FunctionSpy()
      const fn = new AsyncFunctionSpy(fakeFn)

      await fn('call1Arg1')
      await fn('call2Arg1', 'call1Arg2')

      assert.deepEqual(fakeFn.calls, [
        ['call1Arg1'],
        ['call2Arg1', 'call1Arg2'],
      ])
    })
  })
})