export default class BorshchRouterManager {
  constructor({history}) {
    this.#history = history
  }

  init({defaultRoute, structure, routes}) {
    this.#defaultRoute = defaultRoute
    this.#structure = structure
    this.#routes = routes

    this.#history.on('pathChange', ({nextPath}) => this.#renderRoute(nextPath))
    this.#renderRoute(this.#history.path)
  }

  navigate(path) {
    if (!path)
      throw new BorshchRouterError('Navigation path is not provided')

    if(path !== this.#history.path)
      this.#history.navigate(path)
  }

  on(event, listener) {
    this.#history.on(event, listener)
  }

  #routes
  #defaultRoute
  #structure
  #history

  #renderRoute(nextPath) {
    const route = this.#routes.find(({path}) => path === nextPath) ?? this.#defaultRoute

    this.#structure.content.replaceChildren(route)
    route.render()
  }
}

export class BorshchRouterError extends Error {
  constructor(message) {
    super(message)
  }
}
