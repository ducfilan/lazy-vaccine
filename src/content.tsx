import * as React from "react"
import { renderToString } from "react-dom/server"

import PageInjector from "./background/PageInjector"
import { FlashCardTemplate } from "./background/templates/Flashcard"
import { addDynamicEventListener, hrefToSiteName, htmlStringToHtmlNode } from "./background/DomManipulator"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { getRandomSubscribedItem } from "./background/MessagingFacade"
import { KeyValuePair, SetInfoItem } from "./common/types/types"
import { formatString } from "./common/utils/stringUtils"
import { detectPageChanged } from "./common/utils/domUtils"

const getHref = () => document.location.href
const prevItemsStacks: { [key: string]: SetInfoItem[] } = {}

const randomTemplateValues = async () => {
  const item = await randomSetInfoItem()
  if (!item) return []

  prevItemsStacks[item._id] = [item]

  return toTemplateValues(item, { firstStackId: item._id })
}

const randomSetInfoItem = async (): Promise<SetInfoItem | null> => {
  return await getRandomSubscribedItem()
}

const toTemplateValues = (item: SetInfoItem | null | undefined, otherKeyValueItems: { [key: string]: string } = {}) => {
  if (!item) return []

  const itemKeyValue = Object.entries(item).map(([key, value]) => ({ key, value } as KeyValuePair))
  let otherKeyValue = Object.entries(otherKeyValueItems).map(([key, value]) => ({ key, value } as KeyValuePair))
  otherKeyValue = [...otherKeyValue, { key: "website", value: hrefToSiteName(getHref()) }]

  return [...itemKeyValue, ...otherKeyValue]
}

injectCards()
detectPageChanged(injectCards)
registerFlashcardEvents()

async function injectCards() {
  try {
    removeOldCards()

    const injectionTargets = new InjectionTargetFactory(getHref()).getTargets()

    injectionTargets.forEach(async ({ type, selector, siblingSelector }) => {
      const injector = new PageInjector(1, type, selector, siblingSelector)

      injector.waitInject(renderToString(<FlashCardTemplate />), randomTemplateValues)
    })
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
  }
}

function removeOldCards() {
  document.querySelectorAll(".lazy-vaccine").forEach((el) => el.remove())
}

function registerFlashcardEvents() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card-wrapper", (e: Event) => {
    e.stopPropagation()

    const cardElement = e.target as Element
    cardElement.closest(".flash-card-wrapper")?.classList.toggle("is-flipped")
  })

  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--next-button", async (e: Event) => {
    e.stopPropagation()

    const randomItem = await randomSetInfoItem()
    if (!randomItem) return // TODO: Notice problem.

    const nextButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = nextButton.closest(".lazy-vaccine")
    const firstStackId = wrapperElement?.dataset["firstStackId"]

    if (!firstStackId) return // TODO: Notice problem.

    prevItemsStacks[firstStackId].push(randomItem)

    const newItemNode = htmlStringToHtmlNode(
      formatString(renderToString(<FlashCardTemplate />), toTemplateValues(randomItem, { firstStackId }))
    )

    wrapperElement?.replaceWith(newItemNode)
  })

  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--prev-button", async (e: Event) => {
    e.stopPropagation()

    const prevButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = prevButton.closest(".lazy-vaccine")
    const firstStackId = wrapperElement?.dataset["firstStackId"]

    if (!firstStackId || prevItemsStacks[firstStackId].length < 2) return // TODO: Notice problem.

    prevItemsStacks[firstStackId].pop()
    const prevItem = prevItemsStacks[firstStackId].slice(-1)[0]
    if (!prevItem) return

    const newItemNode = htmlStringToHtmlNode(
      formatString(renderToString(<FlashCardTemplate />), toTemplateValues(prevItem, { firstStackId }))
    )
    wrapperElement?.replaceWith(newItemNode)
  })
}
