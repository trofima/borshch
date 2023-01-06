import {BorshchComponent} from '../../../src/common/component'
import render from './playground.ejs'

class PlaygroundApp extends BorshchComponent {
  render() {
    return render(this.#data)
  }

  setData(data) {
    this.#data = data
  }

  #data = {}
}

export default PlaygroundApp.define()
