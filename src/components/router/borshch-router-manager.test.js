import {assert} from 'chai'
import BorshchRouterManager, {BorshchRouterError} from './borshch-router-manager'
import {
  ElementSpy, RouteSpy, HistorySpy, TransitionSpy, AsyncFunctionSpy, PageSpy,
} from '../../test-utilities'
import {Deferred} from '../../utilities'

suite('Borshch route manager', () => {
  suite('initialization', () => {
    test('subscribe route render to history path change', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures()
        .withRoutes([new RouteSpy({path: '/'}), new RouteSpy({path: '/next'})])
        .withHistoryPath('/')
        .withRenderRouteSpy()
        .build()

      const [event, renderRoute] = historyMock.on.argumentsAt(0)

      renderRoute({nextPath: '/next', prevPath: '/'})

      assert.equal(event, 'pathChange')
      assert.deepEqual(borshchRouteManager.renderRoute.argumentsAt(0), ['/next', '/'])
    })
  })

  suite('navigation', () => {
    test('throw error when path was not provided', async() => {
      const {borshchRouteManager} = new TestFixtures().build()

      assert.throws(
        () =>  borshchRouteManager.navigate(),
        BorshchRouterError,
        'Navigation path was not provided',
      )
    })

    test('update path', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/next-path')

      assert.deepEqual(historyMock.navigate.argumentsAt(0), ['/next-path'])
    })

    test('update another path', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/another-path')

      assert.deepEqual(historyMock.navigate.argumentsAt(0), ['/another-path'])
    })

    test('does not navigate when path is the same as current in history', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/')

      assert.equal(historyMock.navigate.callCount, 0)
    })
  })

  suite('route rendering transitions', () => {
    suite('none', () => {
      test('default route render', async() => {
        const {borshchRouteManager, containerMock, defaultRoute} = new TestFixtures()
          .withRoutes([])
          .withHistoryPath('/')
          .build()

        await borshchRouteManager.renderRoute('/not-existed')

        assert.deepEqual(containerMock.replaceChildren.argumentsAt(0), [defaultRoute])
        assert(defaultRoute.render.callCount === 1, 'route was not rendered')
      })

      test('next route render by a default path from history', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager, containerMock} = new TestFixtures()
          .withRoutes([nextRoute])
          .withHistoryPath('/')
          .build()

        await borshchRouteManager.renderRoute()

        assert.deepEqual(containerMock.replaceChildren.argumentsAt(0), [nextRoute])
        assert(nextRoute.render.callCount === 1, 'route was not rendered')
      })

      test('next route render by another default path from history', async() => {
        const nextRoute = new RouteSpy({path: '/next'})
        const {borshchRouteManager, containerMock} = new TestFixtures()
          .withRoutes([nextRoute])
          .withHistoryPath('/next')
          .build()

        await borshchRouteManager.renderRoute()

        assert.deepEqual(containerMock.replaceChildren.argumentsAt(0), [nextRoute])
        assert(nextRoute.render.callCount === 1, 'route was not rendered')
      })

      test('next route render', async() => {
        const nextRoute = new RouteSpy({path: '/next'})
        const {borshchRouteManager, containerMock} = new TestFixtures()
          .withRoutes([nextRoute])
          .withHistoryPath('/')
          .build()

        await borshchRouteManager.renderRoute('/next')

        assert.deepEqual(containerMock.replaceChildren.argumentsAt(0), [nextRoute])
        assert(nextRoute.render.callCount === 1, 'route was not rendered')
      })

      test('another next route render', async() => {
        const routes = [new RouteSpy({path: '/'}), new RouteSpy({path: '/next'})]
        const [, nextRoute] = routes
        const {borshchRouteManager, containerMock} = new TestFixtures()
          .withRoutes(routes)
          .withHistoryPath('/')
          .build()

        await borshchRouteManager.renderRoute('/next')

        assert.deepEqual(containerMock.replaceChildren.argumentsAt(0), [nextRoute])
        assert(nextRoute.render.callCount === 1, 'route was not rendered')
      })

      test('do not render already rendered route', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .build()

        borshchRouteManager.renderRoute('/')
        await borshchRouteManager.renderRoute('/')

        assert.equal(nextRoute.render.callCount, 1)
      })

      test('render last requested route in a sequence', async() => {
        const routes = [
          new RouteSpy({path: '/'}), new RouteSpy({path: '/omit'}), new RouteSpy({path: '/next'}),
        ]
        const [, omitRoute] = routes
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes(routes)
          .build()

        borshchRouteManager.renderRoute('/')
        borshchRouteManager.renderRoute('/omit')
        await borshchRouteManager.renderRoute('/next')

        assert.equal(omitRoute.render.callCount, 0)
      })

      test('clear previous route', async() => {
        const routes = [
          new RouteSpy({path: '/'}), new RouteSpy({path: '/next'}),
        ]
        const [prevRoute] = routes
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes(routes)
          .build()

        await borshchRouteManager.renderRoute('/')
        await borshchRouteManager.renderRoute('/next')

        assert(prevRoute.clear.callCount === 1, 'route was not cleared')
      })
    })

    suite('dissolve', () => {
      test('entering route style', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(nextRoute.setStyle.argumentsAt(0), [{opacity: 0, position: 'relative'}])
      })

      test('add entering route to container', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager, containerMock} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(containerMock.appendChild.argumentsAt(0), [nextRoute])
      })

      test('render entering route', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert(nextRoute.render.callCount === 1, 'next route has not been rendered')
      })

      test('animate entering route', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(nextRoute.transit.argumentsAt(0), [
          [{opacity: 0}, {opacity: 1}],
          {duration: 100},
        ])
      })

      test('wait for entering transition to be finished', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const runningTransition = stubRunningTransitionFor(nextRoute)
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        const renderingRoute = borshchRouteManager
          .renderRoute('/')
          .then(() => assert(
            runningTransition.state === 'resolved',
            'transition has not been finished yet',
          ))

        setImmediate(() => runningTransition.resolve())

        await renderingRoute
      })

      test('animate entering route with another duration', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 200})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.equal(nextRoute.transit.argumentsAt(0)[1].duration, 200)
      })

      test('leaving route style', async() => {
        const prevRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = await new TestFixtures()
          .withRoutes([prevRoute, new RouteSpy({path: '/next'})])
          .withTransition({name: 'dissolve', duration: 100})
          .buildWithRenderedRoute('/')

        await borshchRouteManager.renderRoute('/next')

        assert.deepEqual(prevRoute.setStyle.argumentsAt(1), [{opacity: 1, position: 'absolute', inset: '0px'}])
      })

      test('animate leaving route', async() => {
        const prevRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = await new TestFixtures()
          .withRoutes([prevRoute, new RouteSpy({path: '/next'})])
          .withTransition({name: 'dissolve', duration: 100})
          .buildWithRenderedRoute('/')

        await borshchRouteManager.renderRoute('/next')

        assert.deepEqual(prevRoute.transit.argumentsAt(1), [
          [{opacity: 1}, {opacity: 0}],
          {duration: 100},
        ])
      })

      test('wait for living transition to be finished', async() => {
        const leavingRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = await new TestFixtures()
          .withRoutes([leavingRoute, new RouteSpy({path: '/next'})])
          .withTransition({name: 'dissolve', duration: 100})
          .buildWithRenderedRoute('/')
        const runningLeavingTransition = stubRunningTransitionFor(leavingRoute)

        const renderingRoute = borshchRouteManager
          .renderRoute('/next')
          .then(() => assert(
            runningLeavingTransition.state === 'resolved',
            'transition has not been finished yet',
          ))
        setImmediate(() => runningLeavingTransition.resolve())

        await renderingRoute
      })

      test('remove leaving route after transition finishes', async() => {
        const leavingRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager, containerMock} = await new TestFixtures()
          .withRoutes([leavingRoute, new RouteSpy({path: '/next'})])
          .withTransition({name: 'dissolve', duration: 100})
          .buildWithRenderedRoute('/')
        const runningLeavingTransition = stubRunningTransitionFor(leavingRoute)

        const renderingRouter = borshchRouteManager.renderRoute('/next')
        setImmediate(() => {
          assert.equal(containerMock.removeChild.callCount, 0)
          assert.equal(leavingRoute.clear.callCount, 0)
          runningLeavingTransition.resolve()
        })

        await renderingRouter

        assert.deepEqual(containerMock.removeChild.argumentsAt(0), [leavingRoute])
        assert.equal(leavingRoute.clear.callCount, 1)
      })

      test('finnish ongoing entering transition before starting the next transition', async() => {
        const prevEnteringRouteTransition = new TransitionSpy({state: 'running'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([
            new RouteSpy({path: '/', transition: prevEnteringRouteTransition}),
            new RouteSpy({path: '/next'}),
          ])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        const ongoingRouteRendering = borshchRouteManager.renderRoute('/')
        queueMicrotask(() => borshchRouteManager.renderRoute('/next'))
        await ongoingRouteRendering

        assert.equal(prevEnteringRouteTransition.finish.callCount, 1)
      })

      test('finnish ongoing leaving transition before starting the next transition', async() => {
        const prevLeavingRouteTransition = new TransitionSpy({state: 'running'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([
            new RouteSpy({path: '/'}),
            new RouteSpy({path: '/next', transition: prevLeavingRouteTransition}),
          ])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')
        const ongoingRouteRendering = borshchRouteManager.renderRoute('/next')
        queueMicrotask(() => borshchRouteManager.renderRoute('/'))
        await ongoingRouteRendering

        assert.equal(prevLeavingRouteTransition.finish.callCount, 1)
      })

      test('do not try to finish already finished transitions', async() => {
        const prevLeavingRouteTransition = new TransitionSpy({state: 'idle'})
        const prevEnteringRouteTransition = new TransitionSpy({state: 'idle'})
        const {borshchRouteManager} = await new TestFixtures()
          .withRoutes([
            new RouteSpy({path: '/', transition: prevLeavingRouteTransition}),
            new RouteSpy({path: '/next', transition: prevEnteringRouteTransition}),
            new RouteSpy({path: '/next-next'}),
          ])
          .withTransition({name: 'dissolve', duration: 100})
          .buildWithRenderedRoute('/')

        await borshchRouteManager.renderRoute('/next')
        await borshchRouteManager.renderRoute('/next-next')

        assert.equal(prevLeavingRouteTransition.finish.callCount, 0)
        assert.equal(prevEnteringRouteTransition.finish.callCount, 0)
      })
    })
  })

  suite('subscription', () => {
    test('subscribe listener to history path change', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.on('pathChange', listener)

      assert.deepEqual(historyMock.on.argumentsAt(1), ['pathChange', listener])
    })

    test('subscribe listener to history hash change', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.on('hashChange', listener)

      assert.deepEqual(historyMock.on.argumentsAt(1), ['hashChange', listener])
    })

    test('unsubscribe listener from history path change', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.off('pathChange', listener)

      assert.deepEqual(historyMock.off.argumentsAt(0), ['pathChange', listener])
    })

    test('unsubscribe listener from history path change', async() => {
      const {borshchRouteManager, historyMock} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.off('hashChange', listener)

      assert.deepEqual(historyMock.off.argumentsAt(0), ['hashChange', listener])
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

  withRenderRouteSpy() {
    this.#BorshchRouterManager = class extends this.#BorshchRouterManager {
      renderRoute = new AsyncFunctionSpy()
    }

    return this
  }

  build() {
    const historyMock = new HistorySpy({path: this.#historyPath})
    const pageSpy = new PageSpy()
    const defaultRoute = new RouteSpy()
    const containerMock = new ElementSpy()
    const borshchRouteManager = new this.#BorshchRouterManager({
      history: historyMock,
      page: pageSpy,
    })

    borshchRouteManager.init({
      defaultRoute,
      transition: this.#transition,
      routes: this.#routes,
      container: containerMock
    })

    return {borshchRouteManager, historyMock, pageSpy, containerMock, defaultRoute}
  }

  async buildWithRenderedRoute(path) {
    const {borshchRouteManager, ...rest} = this.build()

    await borshchRouteManager.renderRoute(path)

    return {borshchRouteManager, ...rest}
  }

  #routes = []
  #historyPath
  #transition
  #BorshchRouterManager = BorshchRouterManager
}

function stubRunningTransitionFor(route) {
  const runningTransition = new Deferred()
  const routeTransitionSpy = new TransitionSpy({running: runningTransition.promise})
  route.stubTransition(routeTransitionSpy)

  return runningTransition
}
