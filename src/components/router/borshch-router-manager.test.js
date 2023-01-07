import {assert} from 'chai'
import BorshchRouterManager, {BorshchRouterError} from './borshch-router-manager'
import {
  ElementSpy, RouteSpy, HistorySpy, TransitionSpy, AsyncFunctionSpy, PageSpy,
} from '../../test-utilities'
import {Deferred} from '../../utilities'

suite('Borshch route manager', () => {
  suite('initialization', () => {
    test('subscribe route render to history path change', async() => {
      const {borshchRouteManager, history} = new TestFixtures()
        .withRoutes([new RouteSpy({path: '/'}), new RouteSpy({path: '/next'})])
        .withHistoryPath('/')
        .withRenderRouteSpy()
        .build()

      const [event, renderRoute] = history.on.argumentsAt(0)

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
      const {borshchRouteManager, history} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/next-path')

      assert.deepEqual(history.navigate.argumentsAt(0), ['/next-path'])
    })

    test('update another path', async() => {
      const {borshchRouteManager, history} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/another-path')

      assert.deepEqual(history.navigate.argumentsAt(0), ['/another-path'])
    })

    test('does not navigate when path is the same as current in history', async() => {
      const {borshchRouteManager, history} = new TestFixtures()
        .withHistoryPath('/')
        .build()

      borshchRouteManager.navigate('/')

      assert.equal(history.navigate.callCount, 0)
    })
  })

  suite('route rendering transitions', () => {
    suite('none', () => {
      test('render default route', async() => {
        const {borshchRouteManager, container, defaultRoute} = new TestFixtures()
          .withRoutes([])
          .build()

        await borshchRouteManager.renderRoute('/not-existed')

        assert.deepEqual(container.replaceChildren.argumentsAt(0), [defaultRoute])
        assert(defaultRoute.render.callCount === 1, 'route was not rendered')
      })

      test('render next route by a default path from history', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager, container} = new TestFixtures()
          .withRoutes([nextRoute])
          .withHistoryPath('/')
          .build()

        await borshchRouteManager.renderRoute()

        assert.deepEqual(container.replaceChildren.argumentsAt(0), [nextRoute])
        assert(nextRoute.render.callCount === 1, 'route was not rendered')
      })

      test('render next route by another default path from history', async() => {
        const nextRoute = new RouteSpy({path: '/next'})
        const {borshchRouteManager, container} = new TestFixtures()
          .withRoutes([nextRoute])
          .withHistoryPath('/next')
          .build()

        await borshchRouteManager.renderRoute()

        assert.deepEqual(container.replaceChildren.argumentsAt(0), [nextRoute])
        assert(nextRoute.render.callCount === 1, 'route was not rendered')
      })

      test('render next route', async() => {
        const nextRoute = new RouteSpy({path: '/next'})
        const {borshchRouteManager, container} = new TestFixtures()
          .withRoutes([nextRoute])
          .build()

        await borshchRouteManager.renderRoute('/next')

        assert.deepEqual(container.replaceChildren.argumentsAt(0), [nextRoute])
        assert(nextRoute.render.callCount === 1, 'route was not rendered')
      })

      test('render another next route', async() => {
        const nextRoute = new RouteSpy({path: '/next'})
        const {borshchRouteManager, container} = new TestFixtures()
          .withRoutes([new RouteSpy({path: '/'}), nextRoute])
          .build()

        await borshchRouteManager.renderRoute('/next')

        assert.deepEqual(container.replaceChildren.argumentsAt(0), [nextRoute])
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
        const omitRoute = new RouteSpy({path: '/omit'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([new RouteSpy({path: '/'}), omitRoute, new RouteSpy({path: '/next'})])
          .build()

        borshchRouteManager.renderRoute('/')
        borshchRouteManager.renderRoute('/omit')
        await borshchRouteManager.renderRoute('/next')

        assert.equal(omitRoute.render.callCount, 0)
      })

      test('clear default route when it is rendered', async() => {
        const {borshchRouteManager, defaultRoute} = new TestFixtures()
          .withRoutes([new RouteSpy({path: '/'})])
          .build()
        defaultRoute.stubRendered(true)

        await borshchRouteManager.renderRoute('/')

        assert.equal(defaultRoute.clear.callCount, 1)
      })

      test('do not clear default route when it is not rendered', async() => {
        const {borshchRouteManager, defaultRoute} = new TestFixtures()
          .withRoutes([new RouteSpy({path: '/'})], [new RouteSpy({path: '/next'})])
          .build()
        defaultRoute.stubRendered(false)

        await borshchRouteManager.renderRoute('/')

        assert.equal(defaultRoute.clear.callCount, 0)
      })

      test('clear previous route', async() => {
        const prevRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager} = new TestFixtures()
          .withRoutes([prevRoute, new RouteSpy({path: '/next'})])
          .build()

        await borshchRouteManager.renderRoute('/')
        await borshchRouteManager.renderRoute('/next')

        assert.equal(prevRoute.clear.callCount, 1)
      })

      test('set page title', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTitle('Title')
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(page.setTitle.argumentsAt(0), ['Title'])
      })

      test('set another page title', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTitle('Another Title')
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(page.setTitle.argumentsAt(0), ['Another Title'])
      })

      test('does not set page title when it was not provided', async() => {
        const nextRoute = new RouteSpy({path: '/'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTitle(undefined)
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.equal(page.setTitle.callCount, 0)
      })

      test('add next router name to page title', async() => {
        const nextRoute = new RouteSpy({path: '/', name: 'Name'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTitle('Title')
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(page.setTitle.argumentsAt(0), ['Title - Name'])
      })

      test('add another next router name to page title', async() => {
        const nextRoute = new RouteSpy({path: '/', name: 'Another Name'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTitle('Title')
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(page.setTitle.argumentsAt(0), ['Title - Another Name'])
      })

      test('set only next router name to page title when title was not provided', async() => {
        const nextRoute = new RouteSpy({path: '/', name: 'Name'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTitle(undefined)
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(page.setTitle.argumentsAt(0), ['Name'])
      })

      test('set route description to page description', async() => {
        const nextRoute = new RouteSpy({path: '/', description: 'description'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(page.setMeta.argumentsAt(0), ['description', 'description'])
      })

      test('set another route description to page description', async() => {
        const nextRoute = new RouteSpy({path: '/', description: 'another description'})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(page.setMeta.argumentsAt(0), ['description', 'another description'])
      })

      test('does not set page description when route description was not provided', async() => {
        const nextRoute = new RouteSpy({path: '/', description: undefined})
        const {borshchRouteManager, page} = new TestFixtures()
          .withRoutes([nextRoute])
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.equal(page.setMeta.callCount, 0)
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
        const {borshchRouteManager, container} = new TestFixtures()
          .withRoutes([nextRoute])
          .withTransition({name: 'dissolve', duration: 100})
          .build()

        await borshchRouteManager.renderRoute('/')

        assert.deepEqual(container.appendChild.argumentsAt(0), [nextRoute])
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
        const {borshchRouteManager, container} = await new TestFixtures()
          .withRoutes([leavingRoute, new RouteSpy({path: '/next'})])
          .withTransition({name: 'dissolve', duration: 100})
          .buildWithRenderedRoute('/')
        const runningLeavingTransition = stubRunningTransitionFor(leavingRoute)

        const renderingRouter = borshchRouteManager.renderRoute('/next')
        setImmediate(() => {
          assert.equal(container.removeChild.callCount, 0)
          assert.equal(leavingRoute.clear.callCount, 0)
          runningLeavingTransition.resolve()
        })

        await renderingRouter

        assert.deepEqual(container.removeChild.argumentsAt(0), [leavingRoute])
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
      const {borshchRouteManager, history} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.on('pathChange', listener)

      assert.deepEqual(history.on.argumentsAt(1), ['pathChange', listener])
    })

    test('subscribe listener to history hash change', async() => {
      const {borshchRouteManager, history} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.on('hashChange', listener)

      assert.deepEqual(history.on.argumentsAt(1), ['hashChange', listener])
    })

    test('unsubscribe listener from history path change', async() => {
      const {borshchRouteManager, history} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.off('pathChange', listener)

      assert.deepEqual(history.off.argumentsAt(0), ['pathChange', listener])
    })

    test('unsubscribe listener from history path change', async() => {
      const {borshchRouteManager, history} = new TestFixtures().build()
      const listener = () => {}

      borshchRouteManager.off('hashChange', listener)

      assert.deepEqual(history.off.argumentsAt(0), ['hashChange', listener])
    })
  })
})

class TestFixtures {
  withTitle(title) {
    this.#title = title
    return this
  }

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
    const history = new HistorySpy({path: this.#historyPath})
    const page = new PageSpy()
    const defaultRoute = new RouteSpy()
    const container = new ElementSpy()
    const borshchRouteManager = new this.#BorshchRouterManager({
      history: history,
      page: page,
    })

    borshchRouteManager.init({
      defaultRoute, container,
      title: this.#title,
      transition: this.#transition,
      routes: this.#routes,
    })

    return {borshchRouteManager, history, page, container, defaultRoute}
  }

  async buildWithRenderedRoute(path) {
    const {borshchRouteManager, ...rest} = this.build()

    await borshchRouteManager.renderRoute(path)

    return {borshchRouteManager, ...rest}
  }

  #title = ''
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
