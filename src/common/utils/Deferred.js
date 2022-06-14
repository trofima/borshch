export default class Deferred {
  constructor () {
    this.resolve = null
    this.reject = null

    this.promise = new Promise((resolve, reject) => {
      this.resolve = (...args) => ((resolve(...args), this))
      this.reject = (...args) => ((reject(...args), this))
    })
  }
}
