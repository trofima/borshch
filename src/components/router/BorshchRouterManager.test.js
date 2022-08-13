import {assert} from 'chai'
import BorshchRouterManager, {BorshchRouterError} from './BorshchRouterManager'
import Deferred from '../../common/utils/Deferred'

suite('Borshch route manager', () => {
  suite('initialization', () => {
    test('render initial route to content', async() => {
      const route = new RouteMock({path: '/'})
      const {containerMock} = await new TestFixtures()
        .withRoutes([route])
        .build()

      assert(route.rendered, 'initial route was not rendered')
      assert.equal(containerMock.children[0], route)
    })

    test('render initial route to content according to history path', async() => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/first'})]
      const [, route1] = routes
      const {containerMock} = await new TestFixtures()
        .withRoutes(routes)
        .withHistoryPath('/first')
        .build()

      assert(route1.rendered, 'initial route was not rendered')
      assert.equal(containerMock.children[0], route1)
    })

    test('render default route to content when no rotes match history path', async() => {
      const routes = [new RouteMock({path: '/'})]
      const {containerMock, defaultRoute} = await new TestFixtures()
        .withRoutes(routes)
        .withHistoryPath('/first')
        .build()

      assert(defaultRoute.rendered, 'default route was not rendered')
      assert.equal(containerMock.children[0], defaultRoute)
    })

    test('subscribe route render to history path change', async() => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/first'})]
      const [, route1] = routes
      const {historyMock, containerMock} = await new TestFixtures()
        .withRoutes(routes)
        .build()

      historyMock.emit('pathChange', '/first')

      assert(route1.rendered, 'route was not rendered')
      assert.equal(containerMock.children[0], route1)
    })

    test('render default route on history path change when no rotes match new history path', async() => {
      const routes = [new RouteMock({path: '/'})]
      const {historyMock, containerMock, defaultRoute} = await new TestFixtures()
        .withRoutes(routes)
        .build()

      historyMock.emit('pathChange', '/first')

      assert(defaultRoute.rendered, 'route was not rendered')
      assert.equal(containerMock.children[0], defaultRoute)
    })
  })

  suite('navigation', () => {
    test('update path', async() => {
      const {borshchRouteManager, historyMock} = await new TestFixtures().build()

      borshchRouteManager.navigate('/next-path')

      assert.strictEqual(historyMock.path, '/next-path')
    })

    test('update another path', async() => {
      const {borshchRouteManager, historyMock} = await new TestFixtures().build()

      borshchRouteManager.navigate('/another-path')

      assert.strictEqual(historyMock.path, '/another-path')
    })

    test('throw error when path was not provided', async() => {
      const {borshchRouteManager} = await new TestFixtures().build()

      assert.throws(
        () =>  borshchRouteManager.navigate(),
        BorshchRouterError,
        'Navigation path was not provided',
      )
    })

    test('does not navigate when path is the same as current in history', async() => {
      const {borshchRouteManager, historyMock} = await new TestFixtures().build()
      const initialNavigateCallCount = historyMock.navigateCallCount

      borshchRouteManager.navigate('/')

      assert.equal(historyMock.navigateCallCount, initialNavigateCallCount)
    })
  })

  suite('subscription', () => {
    test('subscribe listener to path change', async() => {
      const {borshchRouteManager, historyMock} = await new TestFixtures().build()
      let listenerCalled = false

      borshchRouteManager.on('pathChange', () => {listenerCalled = true})
      historyMock.emit('pathChange', '/path')

      assert(listenerCalled, 'listener was not called')
    })

    test('subscribe listener to hash change', async() => {
      const {borshchRouteManager, historyMock} = await new TestFixtures().build()
      let listenerCalled = false

      borshchRouteManager.on('hashChange', () => {listenerCalled = true})
      historyMock.emit('hashChange', '/path')

      assert(listenerCalled, 'listener was not called')
    })
  })

  suite('transitions', () => {
    suite('dissolve', () => {
      test('entering and leaving route animations', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const {historyMock} = await new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .scheduleInitialRouteAnimationReset()
          .build()
        const [leavingRoute, enteringRoute] = routes

        leavingRoute.animation.defer()
        enteringRoute.animation.defer()

        historyMock.emit('pathChange', '/next')

        await Promise.all([leavingRoute.animation.succeed(0), enteringRoute.animation.succeed(0)])

        assert.deepEqual(leavingRoute.animation.operationArguments, [{
          transitions: [{opacity: 1}, {opacity: 0}],
          options: {duration: 100, fill: 'forwards'},
        }], 'wrong leaving route animations settings')
        assert.deepEqual(enteringRoute.animation.operationArguments, [{
          transitions: [{opacity: 0}, {opacity: 1}],
          options: {duration: 100, fill: 'forwards'}
        }], 'wrong entering route animations settings')
      })

      test('entering and leaving route animations with different duration', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const {historyMock} = await new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 200})
          .scheduleInitialRouteAnimationReset()
          .build()
        const [leavingRoute, enteringRoute] = routes

        leavingRoute.animation.defer()
        enteringRoute.animation.defer()

        historyMock.emit('pathChange', '/next')

        await Promise.all([leavingRoute.animation.succeed(0), enteringRoute.animation.succeed(0)])

        assert.deepEqual(leavingRoute.animation.operationArguments, [{
          transitions: [{opacity: 1}, {opacity: 0}],
          options: {duration: 200, fill: 'forwards'},
        }], 'wrong leaving route animations settings')
        assert.deepEqual(enteringRoute.animation.operationArguments, [{
          transitions: [{opacity: 0}, {opacity: 1}],
          options: {duration: 200, fill: 'forwards'}
        }], 'wrong entering route animations settings')
      })

      test('render entering route', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const {
          historyMock,
          containerMock,
        } = await new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .scheduleInitialRouteAnimationReset()
          .build()
        const [leavingRoute, enteringRoute] = routes

        leavingRoute.animation.defer()
        enteringRoute.animation.defer()

        historyMock.emit('pathChange', '/next')

        assert(enteringRoute.rendered, 'entering route was not rendered')
        assert.deepEqual(containerMock.children, [leavingRoute, enteringRoute])
      })

      test('set initial styles for routes', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const {historyMock} = await new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .scheduleInitialRouteAnimationReset()
          .build()
        const [leavingRoute, enteringRoute] = routes

        leavingRoute.animation.defer()
        enteringRoute.animation.defer()

        historyMock.emit('pathChange', '/next')

        assert.deepEqual(
          leavingRoute.style,
          {opacity: 1, position: 'absolute', inset: '0px'},
          'leaving route style is incorrect',
        )
        assert.deepEqual(
          enteringRoute.style,
          {opacity: 0, position: 'relative'},
          'entering route style is incorrect',
        )
      })

      test('remove leaving route after animation finishes', async () => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const {historyMock, containerMock} = await new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .scheduleInitialRouteAnimationReset()
          .build()
        const [leavingRoute, enteringRoute] = routes

        leavingRoute.animation.defer()
        enteringRoute.animation.defer()

        historyMock.emit('pathChange', '/next')

        assert.deepEqual(
          containerMock.children,
          [leavingRoute, enteringRoute],
          'leaving route removed too early'
        )
        assert(leavingRoute.rendered, 'leaving route was cleared too early')

        await Promise.all([leavingRoute.animation.succeed(0), enteringRoute.animation.succeed(0)])

        assert.deepEqual(
          containerMock.children,
          [enteringRoute],
          'leaving route was not removed from container',
        )
        assert(!leavingRoute.rendered, 'leaving route was not cleared')
      })

      test('finish ongoing animations', async() => {
        const routes = [
          new RouteMock({path: '/first'}),
          new RouteMock({path: '/second'}),
          new RouteMock({path: '/third'})
        ]
        const [firstRoute, secondRoute, thirdRoute] = routes

        const {historyMock} = await new TestFixtures()
          .withRoutes(routes)
          .withHistoryPath('/first')
          .withTransition({name: 'dissolve', duration: 100})
          .scheduleInitialRouteAnimationReset()
          .build()

        firstRoute.animation.defer()
        secondRoute.animation.defer()
        thirdRoute.animation.defer()

        historyMock.emit('pathChange', '/second')
        historyMock.emit('pathChange', '/third')

        assert(
          firstRoute.currentAnimation.isFinishing,
          'first route leaving animation is not finished',
        )
        assert(
          secondRoute.currentAnimation.isFinishing,
          'second route entering animation is not finished',
        )
      })

      test('waits for finishing of entering animation in init', async() => {
        const enteringRoute = new RouteMock({path: '/'})
        enteringRoute.animation.defer()
        const initializing = new TestFixtures()
          .withRoutes([enteringRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        setTimeout(() => enteringRoute.animation.succeed(0), 0)
        await initializing

        assert.equal(enteringRoute.animation.at(0).state, 'resolved', 'initial animation have not finished')
      })
    })
  })
})

class TestFixtures { //TODO: move mocks to files
  withRoutes(routes) {
    this.#routes = routes
    return this
  }

  withHistoryPath(path) {
    this.#historyPath = path
    return this
  }

  withTransition(transition) {
    this.#transition = transition
    return this
  }

  scheduleInitialRouteAnimationReset() {
    this.#initialTransitionShouldBeReset = true
    return this
  }

  async build() {
    const defaultRoute = new RouteMock()
    const historyMock = new HistoryMock({path: this.#historyPath})
    const borshchRouteManager = new BorshchRouterManager({history: historyMock})
    const containerMock = new ElementMock()

    await borshchRouteManager.init({
      defaultRoute,
      transition: this.#transition,
      routes: this.#routes,
      container: containerMock
    })

    if (this.#initialTransitionShouldBeReset)
      this.#routes.find(({path}) => path === this.#historyPath).animation.reset()

    return {borshchRouteManager, historyMock, containerMock, defaultRoute}
  }

  #routes = []
  #historyPath = '/'
  #transition
  #initialTransitionShouldBeReset = false
}

class RouteMock {
  constructor({path} = {}) {
    this.#path = path
  }

  get rendered() {return this.#rendered}
  get path() {return this.#path}
  get style() {return this.#style}
  get animation() {return this.#animation}
  get currentAnimation() {return this.#currentAnimation}

  render() {
    this.#rendered = true
  }

  clear() {
    this.#rendered = false
  }

  setStyle(style) {
    this.#style = style
  }

  animate(transitions, options) {
    this.#animation.create({transitions, options})
    const index = this.#animation.operationCount - 1

    this.#currentAnimation = new AnimationMock(this.#animation, index)

    return this.#currentAnimation
  }

  #path
  #rendered = false
  #style = {}
  #animation = new AsyncOperationMock('route animation')
  #currentAnimation
}

class ElementMock {
  get children() {return this.#children}
  get removed() {return this.#removed}

  replaceChildren(el) {
    this.#children = [el]
  }

  appendChild(el) {
    this.#children.push(el)
  }

  removeChild(el) {
    this.#children = this.#children.filter(child => child !== el)
  }

  #children = []
  #removed = false
}

class HistoryMock { //TODO: simplify mock??
  constructor({path}) {
    this.#path = path
  }

  get path() {return this.#path}
  get navigateCallCount() {return this.#navigateCallCount}

  navigate(path) {
    this.#path = path
    this.#navigateCallCount++
  }

  on(event, listener) {
    this.#listenersByEvent[event] = [...this.#listenersByEvent[event] ?? [], listener]
  }

  emit(event, nextPath) {
    const prevPath = this.#path

    this.#path = nextPath
    this.#listenersByEvent[event]?.forEach(listener => listener({prevPath, nextPath}))
  }

  #path = ''
  #listenersByEvent = {}
  #navigateCallCount = 0
}

class AsyncOperationMock {
  constructor(name) {
    this.#name = name
  }

  get operations() {
    return this.#operations
  }

  get operationArguments() {
    return this.#operationArguments
  }

  get operationCount() {
    return this.#operations.length
  }

  get name() {
    return this.#name
  }

  create(args) {
    const deferredOperation = new Deferred()

    this.#operationArguments.push(args)
    this.#operations.push(deferredOperation)

    if (!this.#deferred) queueMicrotask(() => this.#error
      ? deferredOperation.reject(this.#error)
      : deferredOperation.resolve(this.#result))

    return deferredOperation.promise
  }

  reset() {
    this.#operationArguments = []
    this.#operations = []
  }

  at(index) {
    return this.#operations[index]
  }

  resolveByDefault(response) {
    this.#result = response
  }

  rejectByDefault(error) {
    this.#error = error
  }

  defer() {
    this.#deferred = true
  }

  async succeed(index, value) {
    const deferredOperation = this.at(index)

    if (deferredOperation) {
      deferredOperation.resolve(value)
      return await deferredOperation.promise
    } else throw new Error(`Async ${this.name} by index ${index} not found`)
  }

  async fail(index, error) {
    const deferredOperation = this.at(index)

    if (deferredOperation) {
      deferredOperation.reject(error)
      return await deferredOperation.promise
    } else throw new Error(`Async ${this.name} by index ${index} not found`)
  }

  #name = ''
  #operationArguments = []
  #operations = []
  #result = undefined
  #error = undefined
  #deferred = false
}

class AnimationMock {
  constructor(animation, index) {
    this.#animation = animation
    this.#index = index
  }

  get isFinishing() {return this.#isFinishing}
  get playing() {return this.#animation.at(this.#index).promise}

  async finish() {
    this.#isFinishing = true
    return this.#animation.succeed(this.#index)
  }

  #animation
  #index
  #isFinishing = false
}