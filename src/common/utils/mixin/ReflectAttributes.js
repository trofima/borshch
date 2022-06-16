export default (...attrs) => Base => class ReflectingAttributes extends Base {
  constructor(...args) {
    super(...args);

    const reflectionDescriptors = attrs.reduce((descriptor, attr) => {
      if (typeof attr === 'string')
        descriptor[attr] = this.#createAttrDescriptor({name: attr});
      else if (typeof attr === 'object')
        descriptor[attr.name] = this.#createAttrDescriptor(attr);

      return descriptor;
    }, {});

    attrs.length && Object.defineProperties(this, reflectionDescriptors);
  }

  #createAttrDescriptor({name, parse, stringify}) {
    return {
      get: () => this.#getAttr(name, parse),
      set: value => this.#setAttr(name, value, stringify),
    }
  }

  #getAttr(name, parse = value => value || true) {
    return this.hasAttribute(name)
      ? parse(this.getAttribute(name))
      : undefined;
  }

  #setAttr(name, value, stringify = value => (value === true ? '' : value)) {
    return value
      ? this.setAttribute(name, stringify(value))
      : this.removeAttribute(name);
  }
}
