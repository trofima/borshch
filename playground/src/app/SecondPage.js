import {Component} from "../../../src";


export default class SecondPage extends Component {
  render() {
    return this.#render()
  }

  #render() {
    return `
      <h1>Second Page</h1>
      <div>Content</div>
    `
  }
}

customElements.define(SecondPage.componentName, SecondPage)
