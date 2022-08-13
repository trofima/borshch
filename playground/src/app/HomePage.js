import {Component} from '../../../src'


export default class HomePage extends Component {
  render() {
    return `
    <div style="overflow: hidden;">
      <div style="margin-top: 40px;">
        <h1>Home Page</h1>
        <div>Content</div>
      </div>
    </div>
  `
  }
}

customElements.define(HomePage.componentName, HomePage)
