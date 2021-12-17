import * as React from "react"
import { renderToString } from "react-dom/server"

import PageInjector from "./background/PageInjector"
import { VideoViewTemplate } from "./background/templates/youtube/VideoView"
import { addDynamicEventListener } from "./background/DomManipulator"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { getRandomSubscribedItem } from "./background/MessagingFacade"
;(async () => {
  try {
    const injectionTargets = new InjectionTargetFactory(window.location.href).getTargets()
    injectionTargets.forEach(async (target) => {
      const injector = new PageInjector(1, target.type, target.selector)

      const item = await getRandomSubscribedItem()
      if (item) {
        injector.waitInject(renderToString(<VideoViewTemplate item={item} />))
      }
    })

    registerFlashcardEvents()
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
  }
})()

function registerFlashcardEvents() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card-wrapper", (e: Event) => {
    const cardElement = e.target as Element
    cardElement.classList.toggle("is-flipped")
  })
}
