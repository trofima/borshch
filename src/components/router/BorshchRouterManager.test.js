import {assert} from 'chai'
import BorshchRouterManager, {BorshchRouterError} from './BorshchRouterManager'

suite('Borshch route manager', () => {
  suite('initialization', () => {
    test(`render initial route to content`, () => {
      const route = new RouteMock({path: '/'})
      const {structureMock} = new TestFixtures({routes: [route], historyPath: '/'})

      assert(route.rendered, `initial route wasn't rendered`)
      assert.equal(structureMock.content.children[0], route)
    })

    test(`render initial route to content according to history path`, () => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/first'})]
      const [, route1] = routes
      const {structureMock} = new TestFixtures({routes, historyPath: '/first'})

      assert(route1.rendered, `initial route wasn't rendered`)
      assert.equal(structureMock.content.children[0], route1)
    })

    test(`render default route to content when no rotes match history path`, () => {
      const routes = [new RouteMock({path: '/'})]
      const {defaultRoute, structureMock} = new TestFixtures({routes, historyPath: '/first'})

      assert(defaultRoute.rendered, `default route wasn't rendered`)
      assert.equal(structureMock.content.children[0], defaultRoute)
    })

    test(`subscribe route render to history path change`, () => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/first'})]
      const [, route1] = routes
      const {historyMock, structureMock} = new TestFixtures({routes, historyPath: '/'})
      
      historyMock.emit('pathChange', '/first')

      assert(route1.rendered, `route wasn't rendered`)
      assert.equal(structureMock.content.children[0], route1)
    })

    test(`default route render on history path change when no rotes match new history path`, () => {
      const routes = [new RouteMock({path: '/'})]
      const {historyMock, structureMock, defaultRoute} = new TestFixtures({routes, historyPath: '/'})
      
      historyMock.emit('pathChange', '/first')

      assert(defaultRoute.rendered, `route wasn't rendered`)
      assert.equal(structureMock.content.children[0], defaultRoute)
    })
  })

  suite('navigation', () => {
    test(`update path`, () => {
      const {borshchRouteManager, historyMock} = new TestFixtures({})
  
      borshchRouteManager.navigate('nextPath')
  
      assert.strictEqual(historyMock.path, 'nextPath')
    })
  
    test(`update path from argument`, () => {
      const {borshchRouteManager, historyMock} = new TestFixtures({})
  
      borshchRouteManager.navigate('/another-path')
  
      assert.strictEqual(historyMock.path, '/another-path')
    })
  
    test(`throw error when path wasn't provided`, () => {
      const {borshchRouteManager} = new TestFixtures({})
  
      assert.throws(
        () =>  borshchRouteManager.navigate(), 
        BorshchRouterError, 
        'Navigation path is not provided',
      )
    })

    test(`does nothing when path is the same as current in history`, () => {
      const {borshchRouteManager, historyMock} = new TestFixtures({historyPath: '/'})
      const initialNavigateCallCount = historyMock.navigateCallCount
  
      borshchRouteManager.navigate('/')
  
      assert.equal(historyMock.navigateCallCount, initialNavigateCallCount)
    })
  })

  suite('subscription', () => {
    test(`subscribe listener to path change`, () => {
      const {borshchRouteManager, historyMock} = new TestFixtures({})
      let listenerCalled = false

      borshchRouteManager.on('pathChange', () => {listenerCalled = true})
      historyMock.emit('pathChange', '/path')

      assert(listenerCalled, 'listener was not called')
    })

    test(`subscribe listener to hash change`, () => {
      const {borshchRouteManager, historyMock} = new TestFixtures({})
      let listenerCalled = false

      borshchRouteManager.on('hashChange', () => {listenerCalled = true})
      historyMock.emit('hashChange', '/path')

      assert(listenerCalled, 'listener was not called')
    })
  })
})

class TestFixtures {
  constructor ({routes = [], historyPath = '/'}) {
    const defaultRoute = new RouteMock()
    const historyMock = new HistoryMock({path: historyPath})
    const structureMock = {
      content: new ElementMock()
    }
    const borshchRouteManager = new BorshchRouterManager({history: historyMock})

    borshchRouteManager.init({routes, defaultRoute, structure: structureMock,})

    return {borshchRouteManager, defaultRoute, historyMock, structureMock}
  }
}

class RouteMock {
  constructor({path} = {}) {
    this.#path = path
  }

  get rendered() {return this.#rendered}
  get path() {return this.#path}

  render() {
    this.#rendered = true
  }

  remove() {
    this.#rendered = false
  }

  #path
  #rendered = false
}

class ElementMock {
  get children() {return this.#children}
  get removed() {return this.#removed}

  replaceChildren(el) {
    this.#children = [el]
  }

  appendChild() {
    this.#children.push(el)
  }

  remove() {
    this.#removed = true
  }

  #children = []
  #removed = false
}

class HistoryMock {
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