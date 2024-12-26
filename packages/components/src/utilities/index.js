export function convertPascalToDashCase(str) {
  return str
    ? str.replace(
      /([A-Z])/g,
      (_, upperCaseLetter, offset) => `${offset ? '-' : ''}${upperCaseLetter[0].toLowerCase()}`,
    )
    : ''
}

export async function waitForElementToBeDefined(ElementType) {
  return ElementType.componentName && (await customElements.whenDefined(ElementType.componentName))
}

export function removeEndingSlash(str) {
  return str.length > 1 && str.substr(-1) === '/' ? str.slice(0, -1) : str
}
