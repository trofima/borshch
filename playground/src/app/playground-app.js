import {BorshchComponent} from '../../../src'
import render from './playground-app.ejs'

class PlaygroundApp extends BorshchComponent {
  onConnected() {/* prevent auto html attachment */}

  render() {
    return render(this.#data)
  }

  setData(data) {
    this.#data = data
    this.attach(this.render())
  }

  #data = {}
}

export default PlaygroundApp.define()
