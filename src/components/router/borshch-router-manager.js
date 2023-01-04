import transitionByName from './transitions'
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
    this.#state.lastRequestedTransition = {nextPath: nextRequestedPath, prevPath: prevRequestedPath}

    if (this.#state.ongoingTransitionAnimations.length)
      this.#state.ongoingTransitionAnimations
        .forEach(animation => animation.playState === 'running' && animation.finish())
    await this.#state.currentTransition
    await this.#transit()
  }

  on(event, listener) {
    this.#history.on(event, listener)
  }

  off(event, listener) {
    this.#history.off(event, listener)
  }

  async #transit() {
    const {nextPath, prevPath} = this.#state.lastRequestedTransition

    if (nextPath !== this.#state.currentPath) {
      const nextRoute = this.#routes.find(({path}) => path === nextPath) ?? this.#defaultRoute
      const prevRoute = this.#routes.find(({path}) => path === prevPath)
      this.#state.currentPath = nextPath
      this.#state.currentTransition = transitionByName[this.#transition.name].run({
        nextRoute, prevRoute,
        container: this.#container,
        duration: this.#transition.duration,
        onAnimationsStarted: animations => (this.#state.ongoingTransitionAnimations = animations)
      })
      await this.#state.currentTransition
    }
  }

  #routes
  #defaultRoute
  #container
  #history
  #transition = {name: 'none'}
  #state = {
    currentPath: undefined,
    currentTransition: undefined,
    ongoingTransitionAnimations: [],
    lastRequestedTransition: {},
  }
}

export class BorshchRouterError extends Error {
  constructor(message) {
    super(message)
  }
}
