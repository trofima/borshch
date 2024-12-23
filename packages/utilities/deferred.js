export class Deferred {
  constructor () {
    this.#promise = new Promise((resolve, reject) => {
      this.#state = 'pending'
      this.#resolve = this.#fulfill(resolve, 'resolved')
      this.#reject = this.#fulfill(reject, 'rejected')
    })
  }

  get promise() {return this.#promise}
  get resolve() {return this.#resolve}
  get reject() {return this.#reject}
  get state() {return this.#state}

  #promise
  #resolve
  #reject
  #state = 'idle'

  #fulfill = (fulfill, state) => (arg) => {
    if (this.#state !== 'pending')
      throw new Error(`Promise already ${this.#state}`)
    fulfill(arg)
    this.#state = state
    return this.#promise
  }
}
