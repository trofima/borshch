import ReflectAttributes from '../../../../components/common/mixins/reflect-attributes.js'
import HistoryListener from './HistoryListener.js'
import WindowListener from './WindowListener.js'
import WheelStartListener from './WheelStartListener.js'
import WheelListener from './WheelListener.js'
import SwipeStartListener from './SwipeStartListener.js'
import TouchListener from './TouchListener.js'
import ChildrenObserver from './ChildrenObserver.js'

const mixin = (Base, ...classes) =>
  classes.reduce((mixedClass, nextClass) => nextClass(mixedClass), Base)

export {
  mixin as default,
  ReflectAttributes,
  HistoryListener,
  WindowListener,
  WheelListener,
  WheelStartListener,
  TouchListener,
  SwipeStartListener,
  ChildrenObserver,
}
