import * as React from "react"
import { renderToString } from "react-dom/server"

import PageInjector from "./background/PageInjector"
import { FlashCardTemplate } from "./background/templates/Flashcard"
import { addDynamicEventListener } from "./background/DomManipulator"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { getRandomSubscribedItem } from "./background/MessagingFacade"
;(async () => {
  try {
    const injectionTargets = new InjectionTargetFactory(window.location.href).getTargets()

    injectionTargets.forEach(async ({ type, selector, siblingSelector }) => {
      const injector = new PageInjector(1, type, selector, siblingSelector)

      injector.waitInject(renderToString(<FlashCardTemplate />), getRandomSubscribedItem)
    })

    registerFlashcardEvents()
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
  }
})()

function registerFlashcardEvents() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card-wrapper", (e: Event) => {
    e.stopPropagation()

    const cardElement = e.target as Element
    cardElement.closest(".flash-card-wrapper")?.classList.toggle("is-flipped")
  })
}
