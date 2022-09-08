export {default as Deferred} from './Deferred'

export const pascalToDashCase = str => str
  ? str.replace(/([A-Z])/g, (_, upperCaseLetter, offset) =>
      `${offset ? '-' : ''}${upperCaseLetter[0].toLowerCase()}`)
  : ''

export const elementDefined = async Type =>
  Type.componentName && (await customElements.whenDefined(Type.componentName))
