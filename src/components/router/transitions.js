class NoneTransition {
  async run({container, nextRoute, prevRoute}) {
    container.replaceChildren(nextRoute)
    nextRoute.render()
    prevRoute?.clear()
  }
}

class DissolveTransition {
  async run({duration = 100, container, nextRoute, prevRoute, onTransitionsStarted}) {
    nextRoute.setStyle({opacity: 0, position: 'relative'})
    container.appendChild(nextRoute)
    nextRoute.render()

    const nextRouteTransition = nextRoute.transit(...this.#createTransition(duration, true))
    const transitions = [nextRouteTransition]

    if (prevRoute) {
      prevRoute.setStyle({opacity: 1, position: 'absolute', inset: '0px'})
      const prevRouteTransition = prevRoute.transit(...this.#createTransition(duration, false))
      transitions.push(prevRouteTransition)
      onTransitionsStarted(transitions)

      await prevRouteTransition.playing //TODO: test

      container.removeChild(prevRoute)
      prevRoute.clear()
    } else
      onTransitionsStarted(transitions)

    await Promise.all(transitions.map(transition => transition.playing)) //TODO: test
  }

  #createTransition(duration, entering) {
    return [
      [{opacity: Number(!entering)}, {opacity: Number(entering)}],
      {duration},
    ]
  }
}

export default {
  none: new NoneTransition(),
  dissolve: new DissolveTransition(),
}