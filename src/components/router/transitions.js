class NoneTransition {
  async run({container, nextRoute, prevRoute}) {
    container.replaceChildren(nextRoute)
    nextRoute.render()
    prevRoute?.clear()
  }
}

class DissolveTransition {
  async run({duration = 100, container, nextRoute, prevRoute, onAnimationsStarted}) {
    nextRoute.setStyle({opacity: 0, position: 'relative'})
    container.appendChild(nextRoute)
    nextRoute.render()

    const nextRouteAnimation = nextRoute.animate(...this.#createAnimation(duration, true))
    const animations = [nextRouteAnimation]

    if (prevRoute) {
      prevRoute.setStyle({opacity: 1, position: 'absolute', inset: '0px'})
      const prevRouteAnimation = prevRoute.animate(...this.#createAnimation(duration, false))
      animations.push(prevRouteAnimation)
      onAnimationsStarted(animations)

      await prevRouteAnimation.playing

      container.removeChild(prevRoute)
      prevRoute.clear()
    } else
      onAnimationsStarted(animations)

    await Promise.all(animations.map(animation => animation.playing))
  }

  #createAnimation(duration, entering) {
    return [
      [{opacity: Number(!entering)}, {opacity: Number(entering)}],
      {duration, fill: 'forwards'},
    ]
  }
}

export default {
  none: new NoneTransition(),
  dissolve: new DissolveTransition(),
}