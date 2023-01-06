import {BorshchComponent} from '../../../src/components/common'
import render from './playground-app.ejs'

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
