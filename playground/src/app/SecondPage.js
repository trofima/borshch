import {Component} from "../../../src";


export default class SecondPage extends Component {
  render() {
    return this.#render()
  }

  #render() {
    return `
      <div style="margin-top: 40px">
        <h1>Second Page</h1>
        <div>Content</div>
      </div>
    `
  }
}

customElements.define(SecondPage.componentName, SecondPage)
