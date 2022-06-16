import {Component} from "../../../src";


export default class ThirdPage extends Component {
  render() {
    return this.#render()
  }

  #render() {
    return `
      <div style="margin-top: 40px">
        <h1>Third Page</h1>
        <div>Content</div>
      </div>
    `
  }
}

customElements.define(ThirdPage.componentName, ThirdPage)
