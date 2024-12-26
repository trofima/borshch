import transitionByName from './transition-map.js'
export default class BorshchRouterManager {
  constructor({history, page}) {
    this.#history = history
    this.#page = page
  }

  init({title, defaultRoute, container, routes, transition = this.#transition}) {
    this.#title = title
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

  async renderRoute(nextRequestedPath = this.#history.path) {
    this.#state.lastRequestedTransitionPath = nextRequestedPath

    if (this.#state.ongoingTransitions.length)
      this.#state.ongoingTransitions
        .forEach(transition => transition.state === 'running' && transition.finish())
    await this.#state.currentTransition
    await this.#transit()
  }

  on(event, listener) {
    this.#history.on(event, listener)
  }

  off(event, listener) {
    this.#history.off(event, listener)
  }

  #history
  #page
  #title
  #routes
  #defaultRoute
  #container
  #transition = {name: 'none'}
  #state = {
    currentPath: undefined,
    currentTransition: undefined,
    ongoingTransitions: [],
    lastRequestedTransitionPath: {},
  }

  async #transit() {
    const {
      lastRequestedTransitionPath: nextPath,
      currentPath: prevPath,
    } = this.#state

    if (nextPath !== prevPath) {
      const nextRoute = this.#routes.find(({path}) => path === nextPath) ?? this.#defaultRoute
      const prevRoute = this.#routes.find(({path}) => path === prevPath) ??
        (this.#defaultRoute.rendered ? this.#defaultRoute : undefined)
      this.#setPageMetadata(nextRoute)
      this.#state.currentPath = nextPath
      this.#state.currentTransition = transitionByName[this.#transition.name].run({
        nextRoute, prevRoute,
        container: this.#container,
        duration: this.#transition.duration,
        onTransitionsStarted: transitions => (this.#state.ongoingTransitions = transitions)
      })
      await this.#state.currentTransition
    }
  }

  #setPageMetadata({name, description}) {
    const title = this.#title ?? name
    if (title)
      this.#page.setTitle(this.#title && name ? `${title} - ${name}` : title)
    if (description)
      this.#page.setMeta('description', description)
  }
}

export class BorshchRouterError extends Error {
  constructor(message) {
    super(message)
  }
}
