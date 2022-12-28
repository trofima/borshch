import {assert, expect} from 'chai'
import BorshchRouterManager, {BorshchRouterError} from './BorshchRouterManager'
import {ElementMock, RouteMock, HistoryMock} from '../../test-utilities'

suite('Borshch route manager', () => {
  suite('initialization', () => {
    test('subscribe route render to history path change', async() => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
      const [, nextRoute] = routes
      const {historyMock, containerMock} = new TestFixtures()
        .withRoutes(routes)
        .withHistoryPath('/')
        .build()

      const renderRoute = historyMock.onOperation.at(0)?.listener

      await renderRoute({nextPath: '/next', prevPath: '/'})

      assert.equal(historyMock.onOperation.at(0)?.event, 'pathChange')
      assert(nextRoute.rendered, 'route was not rendered')
      assert.equal(containerMock.children[0], nextRoute)
    })
  })

  suite('route render', () => {
    test('default route render', async() => {
      const {borshchRouteManager, containerMock, defaultRoute} = new TestFixtures()
        .withRoutes([])
        .withHistoryPath('/')
        .build()

      await borshchRouteManager.renderRoute('/not-existed')

      assert(defaultRoute.rendered, 'route was not rendered')
      assert.deepEqual(containerMock.children, [defaultRoute])
    })

    test('next route render by default path', async() => {
      const nextRoute = new RouteMock({path: '/'})
      const {borshchRouteManager, containerMock} = new TestFixtures()
        .withRoutes([nextRoute])
        .withHistoryPath('/')
        .build()

      await borshchRouteManager.renderRoute()

      assert(nextRoute.rendered, 'route was not rendered')
      assert.deepEqual(containerMock.children, [nextRoute])
    })

    test('next route render by default path from history', async() => {
      const nextRoute = new RouteMock({path: '/next'})
      const {borshchRouteManager, containerMock} = new TestFixtures()
        .withRoutes([nextRoute])
        .withHistoryPath('/next')
        .build()

      await borshchRouteManager.renderRoute()

      assert(nextRoute.rendered, 'route was not rendered')
      assert.deepEqual(containerMock.children, [nextRoute])
    })

    test('next route render', async() => {
      const nextRoute = new RouteMock({path: '/next'})
      const {borshchRouteManager, containerMock} = new TestFixtures()
        .withRoutes([nextRoute])
        .withHistoryPath('/')
        .build()

      await borshchRouteManager.renderRoute('/next')

      assert(nextRoute.rendered, 'route was not rendered')
      assert.deepEqual(containerMock.children, [nextRoute])
    })

    test('another next route render', async() => {
      const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
      const [, nextRoute] = routes
      const {borshchRouteManager, containerMock} = new TestFixtures()
        .withRoutes(routes)
        .withHistoryPath('/')
        .build()

      await borshchRouteManager.renderRoute('/next')

      assert(nextRoute.rendered, 'route was not rendered')
      assert.deepEqual(containerMock.children, [nextRoute])
    })

    test('do not render already rendered route', async() => {
      const nextRoute = new RouteMock({path: '/'})
      const {borshchRouteManager} = new TestFixtures()
        .withRoutes([nextRoute])
        .build()

      borshchRouteManager.renderRoute('/')
      await borshchRouteManager.renderRoute('/')

      assert.equal(nextRoute.renderOperation.callCount, 1)
    })

    test('render last requested route in a sequence', async() => {
      const routes = [
        new RouteMock({path: '/'}), new RouteMock({path: '/omit'}), new RouteMock({path: '/next'}),
      ]
      const [, omitRoute] = routes
      const {borshchRouteManager} = new TestFixtures()
        .withRoutes(routes)
        .build()

      borshchRouteManager.renderRoute('/')
      borshchRouteManager.renderRoute('/omit')
      await borshchRouteManager.renderRoute('/next')

      assert.equal(omitRoute.renderOperation.callCount, 0)
    })

    test('clear previous route', async() => {
      const routes = [
        new RouteMock({path: '/'}), new RouteMock({path: '/next'}),
      ]
      const [prevRoute] = routes
      const {borshchRouteManager} = new TestFixtures()
        .withRoutes(routes)
        .build()

      await borshchRouteManager.renderRoute('/')
      await borshchRouteManager.renderRoute('/next', '/')

      assert.equal(prevRoute.rendered, false)
    })
  })

  suite('navigation', () => {
    test('update path', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/next-path')

      assert.deepEqual(historyMock.navigateOperation.calls, [{path: '/next-path'}])
    })

    test('update another path', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/another-path')

      assert.deepEqual(historyMock.navigateOperation.calls, [{path: '/another-path'}])
    })

    test('does not navigate when path is the same as current in history', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/')

      assert.equal(historyMock.navigateOperation.callCount, 0)
    })

    test('throw error when path was not provided', async() => {
      const {borshchRouteManager} = new TestFixtures().build()

      assert.throws(
        () =>  borshchRouteManager.navigate(),
        BorshchRouterError,
        'Navigation path was not provided',
      )
    })
  })

  suite('transitions', () => {
    suite('dissolve', () => {
      test('entering route style', async() => {
        const nextRoute = new RouteMock({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(nextRoute.style, {opacity: 0, position: 'relative'})
      })

      test('add entering route to container', async() => {
        const nextRoute = new RouteMock({path: '/'})
        const {borshchRouteManager, containerMock} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(containerMock.children, [nextRoute])
      })

      test('render entering route', async() => {
        const nextRoute = new RouteMock({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert(nextRoute.rendered, 'next route has not been rendered')
      })

      test('animate entering route', async() => {
        const nextRoute = new RouteMock({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(nextRoute.animationOperation.calls, [{
          keyframes: [{opacity: 0}, {opacity: 1}],
          options: {duration: 100, fill: 'forwards'},
        }])
      })

      test('animate entering route with another duration', async() => {
        const nextRoute = new RouteMock({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 200})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(nextRoute.animationOperation.calls, [{
          keyframes: [{opacity: 0}, {opacity: 1}],
          options: {duration: 200, fill: 'forwards'},
        }])
      })

      test('finnish previously started entering animation before starting the next transition', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const [prevRoute, nextRoute] = routes
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .build()
        prevRoute.animationOperation.defer()
        nextRoute.animationOperation.defer()

        const prevRendering = borshchRouteManager.renderRoute('/')

        setTimeout(() => {
          borshchRouteManager.renderRoute('/next')
          prevRoute.animationOperation.succeed(0)
        }, 50)

        await prevRendering

        assert.equal(prevRoute.currentAnimation.forcedAction, 'finish')
      })

      test('leaving route style', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const [prevRoute] = routes
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .build()
        await borshchRouteManager.renderRoute('/')

        await borshchRouteManager.renderRoute('/next', '/')

        assert.deepEqual(prevRoute.style, {opacity: 1, position: 'absolute', inset: '0px'})
      })

      test('animate leaving route', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const [prevRoute] = routes
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .build()
        await borshchRouteManager.renderRoute('/')

        await borshchRouteManager.renderRoute('/next', '/')

        assert.deepEqual(prevRoute.animationOperation.at(1), {
          keyframes: [{opacity: 1}, {opacity: 0}],
          options: {duration: 100, fill: 'forwards'},
        })
      })

      test('remove leaving route after animation finishes', async() => {
        const routes = [new RouteMock({path: '/'}), new RouteMock({path: '/next'})]
        const [prevRoute, nextRoute] = routes
        const {borshchRouteManager, containerMock} = new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .build()
        await borshchRouteManager.renderRoute('/')
        prevRoute.animationOperation.defer()

        const routeRendering = borshchRouteManager.renderRoute('/next', '/')

        setTimeout(() => {
          assert.deepEqual(containerMock.children, [prevRoute, nextRoute])
          assert.equal(prevRoute.rendered, true)
          prevRoute.animationOperation.succeed(1)
        }, 0)

        await routeRendering

        assert.deepEqual(containerMock.children, [nextRoute])
        assert.equal(prevRoute.rendered, false)
      })

      test('finnish previously started leaving animation before starting the next transition', async() => {
        const routes = [
          new RouteMock({path: '/'}),
          new RouteMock({path: '/next'}),
          new RouteMock({path: '/next-next'}),
        ]
        const [prevRoute, nextRoute] = routes
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .build()
        prevRoute.animationOperation.defer()
        nextRoute.animationOperation.defer()

        const prevRendering = borshchRouteManager.renderRoute('/next', '/')

        setTimeout(() => {
          borshchRouteManager.renderRoute('/next-next', '/next')
          prevRoute.animationOperation.succeed(0)
          nextRoute.animationOperation.succeed(0)
        }, 50)

        await prevRendering

        assert.equal(prevRoute.currentAnimation.forcedAction, 'finish')
      })

      test('do not try to finnish already finished transitions', async() => {
        const routes = [
          new RouteMock({path: '/'}),
          new RouteMock({path: '/next'}),
        ]
        const [prevRoute] = routes
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes(routes)
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/next', '/')
        borshchRouteManager.renderRoute('/next-next', '/next')

        assert.notEqual(prevRoute.currentAnimation.forcedAction, 'finish')
      })
    })
  })

  suite('subscription', () => {
    test('subscribe listener to path change', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.on('pathChange', listener)

      assert.deepEqual(historyMock.onOperation.at(1), {event: 'pathChange', listener})
    })

    test('subscribe listener to hash change', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.on('hashChange', listener)

      assert.deepEqual(historyMock.onOperation.at(1), {event: 'hashChange', listener})
    })

    test('unsubscribe listener from pathChange', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.off('pathChange', listener)

      assert.deepEqual(historyMock.offOperation.calls, [{event: 'pathChange', listener}])
    })

    test('unsubscribe listener from pathChange', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.off('hashChange', listener)

      assert.deepEqual(historyMock.offOperation.calls, [{event: 'hashChange', listener}])
    })
  })
})

class TestFixtures {
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

  build() {
    const defaultRoute = new RouteMock()
    const historyMock = new HistoryMock({path: this.#historyPath})
    const containerMock = new ElementMock()
    const borshchRouteManager = new BorshchRouterManager()

    borshchRouteManager.init({
      defaultRoute,
      history: historyMock,
      transition: this.#transition,
      routes: this.#routes,
      container: containerMock
    })

    return {borshchRouteManager, historyMock, containerMock, defaultRoute}
  }

  #routes = []
  #historyPath
  #transition
}
