import {Component} from '../../../src'
import render from './playground.ejs'

export default class PlaygroundApp extends Component {
  render() {
    return render(this.#data)
  }

  setData(data) {
    this.#data = data
  }

  #data = {}
}

customElements.define(PlaygroundApp.componentName, PlaygroundApp)
