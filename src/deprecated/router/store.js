import {Store} from '../common/store.js'
import {browserHistory} from '../common/services'

function createNavStore({browserHistory, document}) {
  const defaultState = {
    path: '',
    history: [],
    titlePrefix: '',
    routes: {},
    data: {},
  }

  const state = {...defaultState}

  function setMetaTag(name, value) {
    const metaTag = document.querySelector(`meta[name="${name}"]`) || createMetaTag(name)

    metaTag.setAttribute('content', value)
  }

  function createMetaTag(name) {
    const metaTag = document.createElement('meta')

    metaTag.setAttribute('name', name)
    document.head.appendChild(metaTag)

    return metaTag
  }

  function setPageMeta(path) {
    const {titlePrefix, routes} = state
    const {title, description, keywords} = routes[path]

    document.title = titlePrefix + title
    setMetaTag('description', description)
    setMetaTag('keywords', keywords)
  }

  function updateHistory(newFullPath) {
    const {history} = state

    browserHistory.setFullPath(newFullPath)
    state.history = [newFullPath, ...history]
  }

  return new Store({
    state,
    getters: {
      routes: () => state.routes,
    },
    actions: {
      reset() {
        Object.keys(state).forEach(key => state[key] = defaultState[key])
      },

      initialize({siteName, routes}) {
        state.titlePrefix = `${siteName} | `
        state.routes = routes
      },

      navigate(newFullPath, data = {}) {
        const path = new URL(newFullPath, browserHistory.origin).pathname
        const {path: currentPath} = state

        if (browserHistory.fullPath !== newFullPath)
          updateHistory(newFullPath)
        setPageMeta(path)
        state.path = path
        state.data = data

        return currentPath !== path
      },
    },
  })
}

export default createNavStore({browserHistory, document})
