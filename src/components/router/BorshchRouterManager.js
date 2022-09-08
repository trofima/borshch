export default class BorshchRouterManager {
  constructor({history}) {
    this.#history = history
  }

  async init({defaultRoute, container, routes, transition = this.#transition}) {
    this.#defaultRoute = defaultRoute
    this.#container = container
    this.#routes = routes
    this.#transition = transition

    this.#history.on('pathChange', ({nextPath, prevPath}) => {
      this.#nextTransitionPaths = {nextPath, prevPath}
      this.#renderRoute()
    })
    this.#nextTransitionPaths = {nextPath: this.#history.path}
    await this.#renderRoute()
  }

  navigate(path) {
    if (!path)
      throw new BorshchRouterError('Navigation path was not provided')

    if(path !== this.#history.path)
      this.#history.navigate(path)
  }

  on(event, listener) {
    this.#history.on(event, listener)
  }

  off(event, listener) { //TODO:
    // this.#history.off(event, listener)
  }

  #routes
  #defaultRoute
  #container
  #history
  #transition = {name: 'none'}
  #routeTransitionAnimations = []
  #nextTransitionPaths = {}

  async #renderRoute() {
    if (this.#routeTransitionAnimations.length) {
      await Promise.all(this.#routeTransitionAnimations.map(animation => animation.finish()))
    }

    const {nextPath, prevPath} = this.#nextTransitionPaths //TODO: it get's last requested transition. magic. refactor
    const nextRoute = this.#routes.find(({path}) => path === nextPath) ?? this.#defaultRoute
    const prevRoute = this.#routes.find(({path}) => path === prevPath)

    if (this.#transition.name === 'dissolve') {
      await this.#dissolve(nextRoute, prevRoute)
    } else {
      this.#none(nextRoute)
    }
  }

  #none(nextRoute) {
    this.#container.replaceChildren(nextRoute)
    nextRoute.render()
  }

  async #dissolve(nextRoute, prevRoute) {
    nextRoute.setStyle({opacity: 0, position: 'relative'})
    this.#container.appendChild(nextRoute)
    nextRoute.render()
    const nextRouteAnimation = nextRoute.animate(...this.#createAnimationOptions(true))
    this.#routeTransitionAnimations = [nextRouteAnimation]

    if (prevRoute) {
      prevRoute.setStyle({opacity: 1, position: 'absolute', inset: '0px'})
      const prevRouteAnimation = prevRoute.animate(...this.#createAnimationOptions(false))
      this.#routeTransitionAnimations.push(prevRouteAnimation)

      await prevRouteAnimation.playing

      this.#container.removeChild(prevRoute)
      prevRoute.clear()
    }

    await Promise.all(this.#routeTransitionAnimations.map(animation => animation.playing))
    this.#routeTransitionAnimations = []
  }

  #createAnimationOptions(entering) {
    return[
      [{opacity: Number(!entering)}, {opacity: Number(entering)}],
      {duration: this.#transition.duration, fill: 'forwards'},
    ]
  }
}

export class BorshchRouterError extends Error {
  constructor(message) {
    super(message)
  }
}
