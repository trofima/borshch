import {browserWindow} from '../../services';

const defaults = {throttle: false};

export default ({throttle = defaults.throttle} = defaults) => Base => class WindowListener extends Base {
  connectedCallback() {
    super.connectedCallback();
    const eventListeners = this.onWindow();

    Object.keys(eventListeners).forEach(name =>
      browserWindow.bind(this, name, eventListeners[name], {throttle}));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    browserWindow.unbind(this);
  }

  onWindow() {
    return {}
  }
};
