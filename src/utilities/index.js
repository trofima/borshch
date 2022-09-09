export {default as Deferred} from './Deferred'
export {default as EventEmitter} from './EventEmitter'

export const pascalToDashCase = str => str
  ? str.replace(/([A-Z])/g, (_, upperCaseLetter, offset) =>
      `${offset ? '-' : ''}${upperCaseLetter[0].toLowerCase()}`)
  : ''

export const elementDefined = async Type =>
  Type.componentName && (await customElements.whenDefined(Type.componentName))

export const removeEndingSlash = str =>
  str.length > 1 && str.substr(-1) === '/' ? str.slice(0, -1) : str
