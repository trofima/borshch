import render from './template.ejs'
import Route from '../route'
import NotFoundRoute from '../notFoundRoute'
import navStore from '../store'
import mixin, {ReflectAttributes, HistoryListener} from '../../common/utils/mixin'
import Component from '../../common/Component.js'
import {browserHistory} from '../../common/services'
import {connect} from '../../common/store.js'
import ExtendedMap from '../../common/utils/ExtendedMap.js'
import Deferred from '../../common/utils/Deferred.js'
export default class BorshchRouter extends mixin(
  Component,
  HistoryListener,
  ReflectAttributes(
    'root', 'transition', 'easing', 'direction',
    {name: 'duration', parse: Number, stringify: String},
  ),
  connect(navStore),
) {
  #routeMap = new ExtendedMap()
  #containerRef = this.host('#container')
  #contentRef = this.host('#content')
  #leavingRef = this.host('#leaving')
  #ongoingAnimations = new Map([
    ['container', new Animation()],
    ['content', new Animation()],
    ['leaving', new Animation()],
  ])
  #currentTransition = new Deferred().resolve()

  constructor() {
    super()

    this.transition = this.transition || 'dissolve'
    this.easing = this.easing || 'ease'
    this.duration = this.duration || 300
  }

  get #transitions() {
    return {
      none: ({currentRoute, nextRoute}) => {
        if (currentRoute) currentRoute.hide()
        this.#displayContent(nextRoute)
      },

      dissolve: async ({currentRoute, nextRoute}) => {
        try {
          const keyframes = enter => [{opacity: Number(!enter)}, {opacity: Number(enter)}]

          await this.#prepareForTransition(nextRoute)

          await Promise.all([
            this.#transit('content', this.#contentRef, keyframes(true)),
            this.#transit('leaving', this.#leavingRef, keyframes(false)),
          ])

          this.#removeLeaving(currentRoute)
          this.#currentTransition.resolve()
        } catch(err) {
          this.#reportTransitionError(err)
        }
      },

      // TODO: think of unifiying transitions with slider. 
      // ammount of intermediate pages should be taken into acount in this case
      slide: async ({path, prevPath, currentRoute, nextRoute, initial}) => {
        if (initial)
          await this.#transitions.dissolve({currentRoute, nextRoute})
        else {
          const next = this.#routeMap.getIndex(path) > this.#routeMap.getIndex(prevPath)
          const keyframes = [{transform: 'translate(0)'}, {transform: `translate(${next ? '-100%' : '100%'})`}]

          this.direction = next ? 'right' : 'left'
          this.#prepareForTransition(currentRoute, nextRoute)

          try {
            await this.#transit('container', this.#containerRef, keyframes)

            this.#removeLeaving(currentRoute)
            this.direction = false
          } catch(err) {
            this.#reportTransitionError(err)
          }
        }
      }
    }
  }

  render() {
    return render()
  }

  async onConnected() {
    super.onConnected()
    await this.#setInitialState()
  }

  onDisconnected() {
    navStore.reset()
  }

  onStore() {
    return {
      navigate: async ({path, data: {initial}}, {path: prevPath}) => {
        const currentRoute = this.#routeMap.get(prevPath)
        const nextRoute = this.#routeMap.get(path)

        this.#transitions[this.transition || 'none']({path, prevPath, currentRoute, nextRoute, initial})
      },
    }
  }

  onHistory() {
    return {
      popstate: ({fullPath}) => navStore.navigate(fullPath),
    }
  }

  async #setInitialState() {
    const [routes, [notFoundRoute]] = await Promise.all([
      this.getChildren(Route),
      this.getChildren(NotFoundRoute),
    ])

    this.#routeMap = [...routes, notFoundRoute].reduce((acc, route) =>
      (acc.set(route.path, route), acc), new ExtendedMap())

    navStore.navigate(browserHistory.fullPath, {initial: true})
  }

  #displayContent(route) {
    this.#contentRef.replace(route)
    route.display()
  }

  #removeLeaving(route) {
    if (route) route.hide()
    this.#leavingRef.remove()
  }

  async #prepareForTransition(nextRoute) {
    for (let [, animation] of this.#ongoingAnimations)
      if (animation.playState === 'running')
        animation.finish()

    await this.#currentTransition.promise

    this.#currentTransition = new Deferred()
    const nextContent = this.#contentRef.get().cloneNode()
    this.#contentRef.get().id = 'leaving' //change selector to change referenced element. TODO: come up with something not so magical
    this.#containerRef.append(nextContent)
    this.#displayContent(nextRoute)
  }

  #transit(name, el, keyframes) {
    const transiting = el.animate(keyframes, {duration: this.duration})

    this.#ongoingAnimations.set(name, el.animation)

    return transiting
  }

  #reportTransitionError(err) {
    console.warn(`Page transition failed. Reason: ${err.message}`)
  }
}
