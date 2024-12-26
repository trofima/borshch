import {browserHistory} from '../../services'

export default Base => class HistoryListener extends Base {
  connectedCallback() {
    super.connectedCallback()
    //TODO trofima: settings validation
    const {hashchange, popstate} = this.onHistory()

    if (popstate)
      browserHistory.bind(this, 'popstate', e =>
        popstate({event: e, href: browserHistory.href, fullPath: browserHistory.fullPath}))

    if (hashchange)
      browserHistory.bind(this, 'hashchange', e => {
        const hash = browserHistory.hash
        const hashParts = hash.split('/').reduce((acc, part, i) =>
            i > 0
              ? [...acc, acc.slice(0, i).join('/') + `/${part}`]
              : [...acc, part],
          [])

        hashchange({
          hash, hashParts,
          event: e,
          prevHash: browserHistory.getHashFrom(e.oldURL),
        })
      })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    browserHistory.unbind(this)
  }

  onHistory() {
    return {
      popstate: () => {},
      hashchange: () => {},
    }
  }
}
