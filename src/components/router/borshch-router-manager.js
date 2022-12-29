export default class BorshchRouterManager {
  constructor({history}) {
    this.#history = history
  }

  init({defaultRoute, container, routes, transition = this.#transition}) {
    this.#defaultRoute = defaultRoute
    this.#container = container
    this.#routes = routes
    this.#transition = transition
    this.#history.on('pathChange', ({nextPath, prevPath}) => this.renderRoute(nextPath, prevPath))
  }

  navigate(path) {
    if (!path)
      throw new BorshchRouterError('Navigation path was not provided')

    if(path !== this.#history.path)
      this.#history.navigate(path)
  }

  async renderRoute(nextRequestedPath = this.#history.path, prevRequestedPath) {
    this.#nextTransitionPaths = {nextPath: nextRequestedPath, prevPath: prevRequestedPath}

    if (this.#routeTransitionAnimations.length)
      this.#routeTransitionAnimations
        .forEach(animation => animation.playState === 'running' && animation.finish())
    await this.#state.currentTransition

    const {nextPath, prevPath} = this.#nextTransitionPaths //TODO: it get's last requested transition. magic. refactor
    const nextRoute = this.#routes.find(({path}) => path === nextPath) ?? this.#defaultRoute
    const prevRoute = this.#routes.find(({path}) => path === prevPath)

    if (nextPath !== this.#state.currentPath) {
      this.#state.currentPath = nextPath
      this.#state.currentTransition = this.#transitionByName[this.#transition.name]
        .run(nextRoute, prevRoute)
      await this.#state.currentTransition
    }
  }

  on(event, listener) {
    this.#history.on(event, listener)
  }

  off(event, listener) {
    this.#history.off(event, listener)
  }

  #routes
  #defaultRoute
  #container
  #history
  #transition = {name: 'none'}
  #routeTransitionAnimations = []
  #nextTransitionPaths = {}
  #state = {
    currentPath: undefined,
    currentTransition: undefined,
  }

  get #transitionByName() {
    return {
      none: {
        run: async (nextRoute, prevRoute) => {
          this.#container.replaceChildren(nextRoute)
          nextRoute.render()
          prevRoute?.clear()
        }
      },
      dissolve: {
        run: async (nextRoute, prevRoute) => {
          const {createAnimation} = this.#transitionByName.dissolve
          nextRoute.setStyle({opacity: 0, position: 'relative'})
          this.#container.appendChild(nextRoute)
          nextRoute.render()

          const nextRouteAnimation = nextRoute.animate(...createAnimation(true))
          this.#routeTransitionAnimations = [nextRouteAnimation]

          if (prevRoute) {
            prevRoute.setStyle({opacity: 1, position: 'absolute', inset: '0px'})
            const prevRouteAnimation = prevRoute.animate(...createAnimation(false))
            this.#routeTransitionAnimations.push(prevRouteAnimation)

            await prevRouteAnimation.playing

            this.#container.removeChild(prevRoute)
            prevRoute.clear()
          }

          await Promise.all(this.#routeTransitionAnimations.map(animation => animation.playing))
        },

        createAnimation: entering => [
          [{opacity: Number(!entering)}, {opacity: Number(entering)}],
          {duration: this.#transition.duration, fill: 'forwards'},
        ],
      },
    }
  }
}

export class BorshchRouterError extends Error {
  constructor(message) {
    super(message)
  }
}
