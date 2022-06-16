function init(data) {
  window.customElements.whenDefined('playground-app')
    .then(() => document.querySelector('playground-app').setData(data));

  appendScript('dist/bundle.js');
}

function appendScript(src) {
  const script = document.createElement('script');

  script.src = src;
  script.type = 'module';
  document.body.appendChild(script);
}