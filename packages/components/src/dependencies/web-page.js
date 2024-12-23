export default class WebPage {
  setTitle(title) {
    document.title = title
  }

  setMeta(name, value) {
    const metaTag = document.querySelector(`meta[name="${name}"]`) || this.#createMetaTag(name)
    metaTag.setAttribute('content', value)
  }

  #createMetaTag(name) {
    const metaTag = document.createElement('meta')
    metaTag.setAttribute('name', name)
    document.head.appendChild(metaTag)

    return metaTag
  }
}
