import {EventEmitter, removeEndingSlash} from '../utilities/index.js'

export default class BrowserHistory extends EventEmitter {
  constructor() {
    super()

    window.addEventListener('popstate', () => {
      const prevPath = this.#path
      const nextPath = removeEndingSlash(window.location.pathname)

      this.#path = nextPath
      this.emit('pathChange', {prevPath, nextPath})
    })
  }

  get path() {return removeEndingSlash(this.#path)}

  navigate(path) {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  #path = window.location.pathname
}
