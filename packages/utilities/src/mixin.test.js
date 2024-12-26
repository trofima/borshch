import {assert} from 'chai'
import {mixin} from './mixin.js'

suite('mixin', () => {
  test('include mixins to Base class prototype', async () => {
    const Mixin = (Base) => class extends Base {
      mixinInstanceProp = 'mixinInstanceProp'
      get mixinPrototypeProp() { return 'mixinPrototypeProp'}
    }

    class Base {
      baseInstanceProp = 'baseInstanceProp'
      get basePrototypeProp() { return 'basePrototypeProp'}
    }

    class Test extends mixin(Base, Mixin) {
      ownInstanceProp = 'ownInstanceProp'
      get ownPrototypeProp() { return 'ownPrototypeProp'}
    }

    const test = new Test()

    assert.equal(test.ownInstanceProp, 'ownInstanceProp')
    assert.equal(test.ownPrototypeProp, 'ownPrototypeProp')

    assert.equal(test.baseInstanceProp, 'baseInstanceProp')
    assert.equal(test.basePrototypeProp, 'basePrototypeProp')

    assert.equal(test.mixinInstanceProp, 'mixinInstanceProp')
    assert.equal(test.mixinPrototypeProp, 'mixinPrototypeProp')
  })

  test('child class overrides all Base and mixed in props', async () => {
    const Mixin = (Base) => class extends Base {
      mixinInstanceProp = 'mixinInstanceProp'
      get mixinPrototypeProp() { return 'mixinPrototypeProp'}
    }

    class Base {
      baseInstanceProp = 'baseInstanceProp'
      get basePrototypeProp() { return 'basePrototypeProp'}
    }

    class Test extends mixin(Base, Mixin) {
      mixinInstanceProp = 'ownInstanceProp'
      get mixinPrototypeProp() { return 'ownPrototypeProp'}
      baseInstanceProp = 'ownInstanceProp'
      get basePrototypeProp() { return 'ownPrototypeProp'}
    }

    const test = new Test()

    assert.equal(test.baseInstanceProp, 'ownInstanceProp')
    assert.equal(test.basePrototypeProp, 'ownPrototypeProp')

    assert.equal(test.mixinInstanceProp, 'ownInstanceProp')
    assert.equal(test.mixinPrototypeProp, 'ownPrototypeProp')
  })

  test('include multiple mixins', async () => {
    const Mixin1 = (Base) => class extends Base {
      mixin1InstanceProp = 'mixin1InstanceProp'
      get mixin1PrototypeProp() { return 'mixin1PrototypeProp'}
    }

    const Mixin2 = (Base) => class extends Base {
      mixin2InstanceProp = 'mixin2InstanceProp'
      get mixin2PrototypeProp() { return 'mixin2PrototypeProp'}
    }

    class Base {}

    class Test extends mixin(Base, Mixin1, Mixin2) {
      ownInstanceProp = 'ownInstanceProp'
      get ownPrototypeProp() { return 'ownPrototypeProp'}
    }

    const test = new Test()

    assert.equal(test.mixin1InstanceProp, 'mixin1InstanceProp')
    assert.equal(test.mixin1PrototypeProp, 'mixin1PrototypeProp')

    assert.equal(test.mixin2InstanceProp, 'mixin2InstanceProp')
    assert.equal(test.mixin2PrototypeProp, 'mixin2PrototypeProp')
  })
})