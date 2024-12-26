export const mixin = (Base, ...classes) =>
  classes.reduce((mixedClass, nextClass) => nextClass(mixedClass), Base)
