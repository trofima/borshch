import {assert} from 'chai'
import {BorshchRouterManager} from '../../components/router/borshchRouterManager1'

suite('Borshch route manager', () => {
  suite('initialization', () => {
    test(`render initial route to content`, () => {
      const route = new RouteMock({path: '/'})
      const {borshchRouteManager, structureMock} = new TestFixtures({routes: [route], historyPath: '/'})

      borshchRouteManager.init()

      assert(route.rendered, `initial route wasn't rendered`)
      assert.equal(structureMock.content.children[0], route)
    })

    test(`render initial route to content according to history path`, () => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/first'})]
      const [, route1] = routes
      const {borshchRouteManager, structureMock} = new TestFixtures({routes, historyPath: '/first'})

      borshchRouteManager.init()

      assert(route1.rendered, `initial route wasn't rendered`)
      assert.equal(structureMock.content.children[0], route1)
    })

    test(`render default route to content when no rotes match history path`, () => {
      const routes = [new RouteMock({path: '/'})]
      const {
        borshchRouteManager, defaultRoute, structureMock,
      } = new TestFixtures({routes, historyPath: '/first'})

      borshchRouteManager.init()

      assert(defaultRoute.rendered, `default route wasn't rendered`)
      assert.equal(structureMock.content.children[0], defaultRoute)
    })

    test(`subscribe route render to history path change`, () => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/first'})]
      const [, route1] = routes
      const {
        borshchRouteManager, historyMock, structureMock,
      } = new TestFixtures({routes, historyPath: '/'})
      
      borshchRouteManager.init()
      historyMock.emit('pathChange', '/first')

      assert(route1.rendered, `route wasn't rendered`)
      assert.equal(structureMock.content.children[0], route1)
    })

    test(`default route render on history path change when no rotes match new history path`, () => {
      const routes = [new RouteMock({path: '/'})]
      const {
        borshchRouteManager, historyMock, structureMock, defaultRoute,
      } = new TestFixtures({routes, historyPath: '/'})
      
      borshchRouteManager.init()
      historyMock.emit('pathChange', '/first')

      assert(defaultRoute.rendered, `route wasn't rendered`)
      assert.equal(structureMock.content.children[0], defaultRoute)
    })
  })

   // test(`path update`, () => {
    //   const {historyMock, borshchRouterController} = new TestFixtures()
  
    //   borshchRouterController.navigate('path')
  
    //   assert.strictEqual(historyMock.path, 'path')
    // })
  
    // test(`path update from argument`, () => {
    //   const {historyMock, borshchRouterController} = new TestFixtures()
  
    //   borshchRouterController.navigate('another-path')
  
    //   assert.strictEqual(historyMock.path, 'another-path')
    // })
  
    // test(`error when path wasn't provided`, () => {
    //   const {borshchRouterController} = new TestFixtures()
  
    //   assert.throws(
    //     () =>  borshchRouterController.navigate(), 
    //     BorshchRouterError, 
    //     'Navigation path is not provided',
    //   )
    // })

  // suite('subscription', () => {
  //   test(`listener subscription to path change`, () => {
  //     const {historyMock, borshchRouterController} = new TestFixtures()
  //     const listener = () => {}

  //     borshchRouterController.on('pathChange', listener)

  //     assert.deepEqual(historyMock.listenersByEvent, {pathChange: [listener]})
  //   })

  //   test(`listener subscription to hash change`, () => {
  //     const {historyMock, borshchRouterController} = new TestFixtures()
  //     const listener = () => {}

  //     borshchRouterController.on('hashChange', listener)

  //     assert.deepEqual(historyMock.listenersByEvent, {hashChange: [listener]})
  //   })
  // })
})

class TestFixtures {
  constructor ({routes = [], historyPath = '/'}) {
    const defaultRoute = new RouteMock()
    const historyMock = new HistoryMock({path: historyPath})
    const structureMock = {
      content: new ElementMock()
    }
    const borshchRouteManager = new BorshchRouterManager({
      routes, defaultRoute, history: historyMock, structure: structureMock,
    })

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
  // get listenersByEvent() {return this.#listenersByEvent}

  navigateTo(path) {
    this.#path = path
  }

  on(event, listener) {
    this.#listenersByEvent[event] = listener
  }

  emit(event, nextPath) {
    const prevPath = this.#path

    this.#path = nextPath
    this.#listenersByEvent[event]({prevPath, nextPath})
  }

  #path = ''
  #listenersByEvent = {}
}