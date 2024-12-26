import Component from '../../common/DeprecatedComponent'
import { browserHistory } from '../../common/services'
import mixin, {
  HistoryListener, ReflectAttributes, SwipeStartListener, WheelStartListener,
  WindowListener, ChildrenObserver,
} from '../../common/utils/mixin'
import Slide from '../slide'
import render from './template.ejs'

const transitions = {
  none: (horizontal, _, {offsetTop, offsetLeft}) => horizontal
    ? {to: {transform: `translate3d(${-offsetLeft}px, 0, 0)`}}
    : {to: {transform: `translate3d(0, ${-offsetTop}px, 0)`}},
  slide: (
    horizontal,
    {offsetTop: prevOffsetTop, offsetLeft: prevOffsetLeft},
    {offsetTop, offsetLeft},
  ) => horizontal
    ? {
      from: {transform: `translate3d(${-prevOffsetLeft}px, 0, 0)`},
      to: {transform: `translate3d(${-offsetLeft}px, 0, 0)`}
    }
    : {
      from: {transform: `translate3d(0, ${-prevOffsetTop}px, 0)`},
      to: {transform: `translate3d(0, ${-offsetTop}px, 0)`}
    },
}

class SliderState {
  #index = 0
  #prevIndex = 0
  #slides = []
  #anchorMap = new Map()

  get index() {return this.#index}
  set index(index) {
    this.#prevIndex = this.#index
    this.#index = index
  }
  get prevIndex() {return this.#prevIndex}
  get lastIndex() {return this.#slides.length - 1}
  get slide() {return this.#slides[this.#index]}
  get prevSlide() {return this.#slides[this.#prevIndex]}
  get slideCount() {return this.#slides.length}
  hash = (index = this.#index) => this.slideByIndex(index).hash
  has = index => Boolean(this.#slides[index])
  slideByHash = ({hash, hashParts}) =>
    this.#anchorMap.get(hashParts.find(hashPart =>
      this.#anchorMap.has(hashPart)) || hash)
  slideByIndex = index => this.#slides[index].el

  setSlides({changingHash, slides}) {
    this.index = 0
    this.#slides = slides.map((slide, i) => ({el: slide, index: i}))

    if (changingHash) this.#slides.forEach(slide => this.#anchorMap.set(slide.el.hash, slide))
  }
}

export default class BorshchSlider extends mixin(
  Component,
  ReflectAttributes(
    'horizontal', 'fullscreen', 'changing-hash', 'transition', 'easing', 'infinite',
    'paralax', 'paralax-first', 'paralax-last',
    {name: 'duration', parse: Number, stringify: String},
  ),
  HistoryListener, WheelStartListener, SwipeStartListener, ChildrenObserver,
  WindowListener({throttle: true}),
) {
  #slider = null
  #background
  #prev
  #next
  #state = new SliderState()

  get #transitionOptions() {return {duration: this.duration, easing: this.easing}}

  get #paralaxFirst() {
    return this['paralax-first'] && (
      this.#state.index === 0
      || this.#state.prevIndex === 0 && this.#state.index === 1
    )
  }

  get #paralaxLast() {
    return this['paralax-last'] && ( //TODO: create case objects (aka pattern matching)?
      this.#state.index === this.#state.lastIndex
      || this.#state.prevIndex === this.#state.lastIndex
        && this.#state.index === this.#state.lastIndex - 1
    )
  }

  constructor() {
    super()

    this.transition = this.transition || 'slide'
    this.duration = this.duration || 300
    this.easing = this.easing || 'ease'
  }

  render() {
    return render()
  }

  onConnected() {
    console.log('onConnected', this)
    super.onConnected()

    this.#slider = this.host('#slider')
    this.#background = this.host('#background')
    this.#prev = this.host('#prev').on('click', () => this.switchSlide(-1))
    this.#next = this.host('#next').on('click', () => this.switchSlide(1))
    this.#initSlides()
  }

  onChildrenChanged() {
    this.#initSlides()
  }

  onHistory() {
    console.log('onHistory', this)
    return {
      hashchange: ({event, hash, hashParts}) => {
        const slide = this.#state.slideByHash({hash, hashParts})

        console.log(hash, this, this.#state.index)

        if (slide && slide.index !== this.#state.index) this.#scrollTo(slide.index, event.oldURL ? this.transition : 'none')
      },
    }
  }

  onWindow() {
    return {
      resize: () => this.#showSlide('none'),
    }
  }

  onWheelStart() {
    return {
      target: this,
      listener: ({direction}) => this.switchSlide(direction),
    }
  }

  onSwipeStart() {
    return {
      target: this,
      listener: ({directionY}) => this.switchSlide(directionY),
    }
  }

  switchSlide(direction) {
    const nextIndex = this.#nextIndex(direction)

    if (this.#state.has(nextIndex)) {
      if (this['changing-hash']) this.#changeHash(this.#state.hash(nextIndex))
      else this.#scrollTo(nextIndex)
    }
  }

  #initSlides = async() => {
    const slides = await this.getChildren(Slide)

    if (slides.length) {
      slides.forEach((slide, i) => slide.setAttribute('slot', i))
      this.#state.setSlides({slides, changingHash: this['changing-hash']})
      this.#dispatchCangeEvent('slideChange', {initial: true})

      if (this['changing-hash']) {
        requestAnimationFrame(() => { //TODO trofima: firefox hack. it calculates offsetTop/offsetLeft incorrectly
          if (browserHistory.hash === '') browserHistory.setHash(this.#state.hash())
          else browserHistory.dispatch('hashchange', {oldURL: ''})
        })
        this.#toggleNavButtons({transition: false})
      } else this.#slideChanged({initial: true})
    }
  }

  #slideChanged = ({initial} = {}) => {
    this.#unlock()
    this.#state.slide.el.displayed()
    this.#dispatchCangeEvent('slideChanged', {initial})
  }

  #dispatchCangeEvent = (name, extra) => this.dispatchEvent(new CustomEvent(name, {
    detail: {next: this.#state.slide, prev: this.#state.prevSlide, ...extra},
  }))

  #nextIndex = direction => {
    const index = this.#state.index + direction

    if (this.infinite)
      return index < 0
        ? this.#state.lastIndex
        : index > this.#state.lastIndex
        ? 0
        : index

    return index
  }

  #lock = () => {
    WheelStartListener.lock()
    SwipeStartListener.lock()
  }

  #unlock = () => {
    WheelStartListener.unlock()
    SwipeStartListener.unlock()
  }

  #changeHash = hash => {
    if (browserHistory.hash !== hash) this.#lock()

    browserHistory.setHash(hash)
  }

  #scrollTo = (index, transition = this.transition) => {
    const slideSwitched = index !== this.#state.index

    console.log('#scrollTo')
    if (slideSwitched) {
      this.#state.index = index
      this.#dispatchCangeEvent('slideChange')
      this.#lock()
      this.#showSlide(transition)
    } else this.#unlock()

    this.#toggleNavButtons({transition: slideSwitched})
  }

  #showSlide = async(transitionName = this.transition) => {
    const {prevSlide: {el: prevEl, index: prevIndex}, slide: {el, index}} = this.#state
    const {animation: prevAnimation} = this.#slider

    const a = () => { //TODO: refactor!!!
      const delta = prevIndex - index
      const direction = Math.abs(delta) / delta // -1 down, 1 up

      let html = ''
      const siblingIndex = prevIndex - direction

      for (let i = Math.min(index, siblingIndex); i <= Math.max(index, siblingIndex); i++) {
        html += `<slot name=${i}></slot>`
      }

      this.#slider[direction < 0 ? 'attach' : 'pretach'](html)
    }

    if (this.infinite) {
      if (prevIndex === this.#state.lastIndex && index === 0) {
        this.#slider.attach(`<slot name=${index}></slot>`)
      } else if (prevIndex === 0 && index === this.#state.lastIndex) {
        this.#slider.pretach(`<slot name=${index}></slot>`)
      } else {
        a()
      }
    } else {
      a()
    }

    const transition = transitions[transitionName](this.horizontal, prevEl, el)



    if (prevAnimation?.playState === 'running') prevAnimation.cancel()

    try {
      if (this.paralax || this.#paralaxFirst || this.#paralaxLast)
        await Promise.all([
          this.#slider.transit(transition, this.#transitionOptions),
          this.#transitBackground(transitionName, index, prevIndex),
        ])
      else
        await this.#slider.transit(transition, {duration: this.duration, easing: this.easing})

      this.#slider.reattach(`<slot name=${index}></slot>`)
      this.#slider.style({transform: 'translate3d(0, 0, 0)'})

      this.#slideChanged()
    } catch (err) {
      console.info(`Slider animation interrupted. Reason: ${err.message}`)
    }
  }

  #transitBackground = async(transitionName, index, prevIndex) => { //TODO: refactor
    const divider = this.#state.slideCount - 1
    const {offsetHeight, offsetWidth} = this.#background.get()

    const backgroundTransition = transitions[transitionName](
      this.horizontal,
      {offsetLeft: offsetWidth * prevIndex / divider, offsetTop: offsetHeight * prevIndex / divider},
      {offsetLeft: offsetWidth * index / divider, offsetTop: offsetHeight * index / divider},
    )

    await this.#background.transit(backgroundTransition, this.#transitionOptions)
  }

  #toggleNavButtons = ({transition} = {transition: true}) => { //TODO: refactor?
    if (!this.infinite) {
      const fadeIn = {from: transition && {opacity: 0}, to: {opacity: 1}}
      const fadeOut = {from: transition && {opacity: 1}, to: {opacity: 0}}

      if (this.#state.index === 0)
        this.#prev.transit(fadeOut, this.#transitionOptions)
      else if (this.#state.prevIndex === 0 && this.#state.index === 1)
        this.#prev.transit(fadeIn, this.#transitionOptions)

      if (this.#state.index === this.#state.lastIndex)
        this.#next.transit(fadeOut, this.#transitionOptions)
      else if (
        this.#state.prevIndex === this.#state.lastIndex
        && this.#state.index === this.#state.lastIndex - 1
      ) this.#next.transit(fadeIn, this.#transitionOptions)
    }
  }
}
