export default class Deferred {
  constructor () {
    this.#state = 'initialized'
    this.#promise = new Promise((resolve, reject) => {
      this.#state = 'pending'
      this.#resolve = value => ((resolve(value), this.#state = 'resolved', this.#promise))
      this.#reject = error => ((reject(error), this.#state = 'rejected', this.#promise))
    })
  }

  get promise() {return this.#promise}
  get resolve() {return this.#resolve}
  get reject() {return this.#reject}
  get state() {return this.#state}

  #promise = null
  #resolve = null
  #reject = null
  #state = 'notInitialized'
}
