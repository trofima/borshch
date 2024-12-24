export class Deferred {
  constructor () {
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve
      this.#reject = reject
    })
  }

  get promise() {return this.#promise}
  get resolve() {return this.#resolve}
  get reject() {return this.#reject}

  #promise
  #resolve
  #reject
}
