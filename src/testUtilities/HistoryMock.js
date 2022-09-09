import {AsyncOperationMock, EventEmitterMock} from '.'

// export default class HistoryMock {
//   constructor({path}) {
//     this.#path = path
//   }

//   get path() {return this.#path}
//   get navigateCallCount() {return this.#navigateCallCount}

//   navigate(path) {
//     this.#path = path
//     this.#navigateCallCount++
//   }

//   on(event, listener) {
//     this.#listenersByEvent[event] = [...this.#listenersByEvent[event] ?? [], listener]
//   }

//   off(event, listener) {
//     throw new Error('not implemented')
//   }

//   emit(event, nextPath) {
//     const prevPath = this.#path

//     this.#path = nextPath
//     this.#listenersByEvent[event]?.forEach(listener => listener({prevPath, nextPath}))
//   }

//   #path = ''
//   #listenersByEvent = {}
//   #navigateCallCount = 0
// }

export default class HistoryMock extends EventEmitterMock {
  constructor({path}) {
    super()
    this.#path = path
  }

  get path() {return this.#path}
  get navigateOperation() {return this.#navigateOperation}

  navigate(path) {
    return this.#navigateOperation.create({path})
  }

  #path = ''
  #navigateOperation = new AsyncOperationMock('History navigate')
}
