import * as React from "react"
import { renderToString } from "react-dom/server"

import PageInjector from "./background/PageInjector"
import { FlashCardTemplate } from "./background/templates/Flashcard"
import { addDynamicEventListener, hrefToSiteName, htmlStringToHtmlNode } from "./background/DomManipulator"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { getRandomSubscribedItem } from "./background/MessagingFacade"
import { KeyValuePair, SetInfoItem } from "./common/types/types"
import { formatString } from "./common/utils/stringUtils"

const href = window.location.href

const randomTemplateValues = async () => {
  const item: SetInfoItem | null = await getRandomSubscribedItem()
  if (!item) return []

  const itemKeyValue = Object.entries(item).map(([key, value]) => ({ key, value } as KeyValuePair))
  const otherKeyValue = [{ key: "website", value: hrefToSiteName(href) }]

  return [...itemKeyValue, ...otherKeyValue]
}

;(async () => {
  try {
    const injectionTargets = new InjectionTargetFactory(href).getTargets()

    injectionTargets.forEach(async ({ type, selector, siblingSelector }) => {
      const injector = new PageInjector(1, type, selector, siblingSelector)

      injector.waitInject(renderToString(<FlashCardTemplate />), randomTemplateValues)
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

  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--next-button", async (e: Event) => {
    e.stopPropagation()

    const newItemNode = htmlStringToHtmlNode(
      formatString(renderToString(<FlashCardTemplate />), await randomTemplateValues())
    )
    const nextButton = e.target as Element
    nextButton.closest(".lazy-vaccine")?.replaceWith(newItemNode)
  })
}
