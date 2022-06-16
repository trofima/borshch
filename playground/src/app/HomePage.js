import {Component} from "../../../src";


export default class HomePage extends Component {
  render() {
    return this.#render()
  }

  #render() {
    return `
      <div style="margin-top: 40px">
        <h1>Home Page</h1>
        <div>Content</div>
      </div>
    `
  }
}

customElements.define(HomePage.componentName, HomePage)
