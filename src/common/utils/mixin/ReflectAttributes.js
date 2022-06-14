const getAttr = (el, name, parse = value => value || true) => el.hasAttribute(name)
  ? parse(el.getAttribute(name))
  : undefined;


const setAttr = (el, name, value, stringify = value => (value === true ? '' : value)) => value
  ? el.setAttribute(name, stringify(value))
  : el.removeAttribute(name);

const createAttrDescriptor = ({el, name, parse, stringify}) => ({
  get: () => getAttr(el, name, parse),
  set: value => setAttr(el, name, value, stringify),
});



export default (...attrs) => Base => class ReflectingAttributes extends Base {
  constructor(...args) {
    super(...args);

    const reflectionDescriptors = attrs.reduce((descriptor, attr) => {
      if (typeof attr === 'string')
        descriptor[attr] = createAttrDescriptor({el: this, name: attr});
      else if (typeof attr === 'object')
        descriptor[attr.name] = createAttrDescriptor({el: this, ...attr});

      return descriptor;
    }, {});

    attrs.length && Object.defineProperties(this, reflectionDescriptors);
  }
};
