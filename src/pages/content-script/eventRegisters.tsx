import * as React from "react"
import { addDynamicEventListener, htmlStringToHtmlNode } from "@/background/DomManipulator"
import { decodeBase64, formatString } from "@/common/utils/stringUtils"
import { renderToString } from "react-dom/server"
import { generateItemValue, toTemplateValues } from "./templateHelpers"
import { FlashCardTemplate } from "@/background/templates/Flashcard"
import { SetInfoItem } from "@/common/types/types"
import { sendInteractItemMessage } from "./messageSenders"
import {
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionNext,
  ItemsInteractionStar,
} from "@/common/consts/constants"
import { getTemplate } from "@/background/PageInjector"

export function registerFlipCardEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--content", (e: Event) => {
    e.stopPropagation()

    const cardElement = e.target as Element
    cardElement.closest(".flash-card-wrapper")?.classList.toggle("is-flipped")
  })
}

export function registerNextItemEvent(
  nextItemGetter: () => Promise<SetInfoItem | null>,
  itemGetter: () => Promise<SetInfoItem | null>
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--next-button", async (e: Event) => {
    e.stopPropagation()

    if (e.isTrusted) {
      const currentItem = await itemGetter()
      if (!currentItem) return // TODO: Notice problem.

      sendInteractItemMessage(currentItem.setId, currentItem._id, ItemsInteractionNext)
        .then(() => {})
        .catch((error) => {
          // TODO: handle error case.
          console.error(error)
        })
    }

    const nextItem = await nextItemGetter()
    if (!nextItem) return // TODO: Notice problem.

    const nextButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = nextButton.closest(".lazy-vaccine")

    const newItemNode = htmlStringToHtmlNode(
      formatString(getTemplate(nextItem.type), toTemplateValues(nextItem, generateItemValue(nextItem)))
    )

    wrapperElement?.replaceWith(newItemNode)
  })
}

export function registerPrevItemEvent(
  prevItemGetter: () => SetInfoItem | null,
  itemGetter: () => Promise<SetInfoItem | null>
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--prev-button", async (e: Event) => {
    e.stopPropagation()

    if (e.isTrusted) {
      const currentItem = await itemGetter()
      if (!currentItem) return // TODO: Notice problem.

      sendInteractItemMessage(currentItem.setId, currentItem._id, ItemsInteractionNext).catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })
    }

    const prevButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = prevButton.closest(".lazy-vaccine")

    const prevItem = prevItemGetter()
    if (!prevItem) return

    const newItemNode = htmlStringToHtmlNode(
      formatString(getTemplate(prevItem.type), toTemplateValues(prevItem, generateItemValue(prevItem)))
    )
    wrapperElement?.replaceWith(newItemNode)
  })
}

export function registerMorePopoverEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card-more-button", (e: Event) => {
    e.stopPropagation()

    const moreButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = moreButton.closest(".lazy-vaccine")

    toggleHiddenPopover(wrapperElement)
  })
}

export function registerNextSetEvent(itemGetter: () => Promise<SetInfoItem | null>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card-next-set-link", async (e: Event) => {
    e.stopPropagation()

    const nextSetButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = nextSetButton.closest(".lazy-vaccine")

    toggleHiddenPopover(wrapperElement)

    const item = await itemGetter()
    if (!item) return // TODO: Notice problem.

    const newItemNode = htmlStringToHtmlNode(
      formatString(
        renderToString(<FlashCardTemplate />),
        toTemplateValues(item, { setId: item.setId, setTitle: item.setTitle })
      )
    )

    wrapperElement?.replaceWith(newItemNode)
  })
}

function toggleHiddenPopover(wrapperElement: HTMLElement | null) {
  wrapperElement?.querySelector(".ant-popover")?.classList.toggle("ant-popover-hidden")
}

export function registerIgnoreEvent(itemGetter: () => Promise<SetInfoItem | null>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--ignore", async (e: Event) => {
    e.stopPropagation()

    const item = await itemGetter()
    if (!item) return // TODO: Notice problem.

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionIgnore)
      .then(() => {})
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })

    const ignoreButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = ignoreButton.closest(".flash-card-wrapper")
    const nextBtn: HTMLElement = wrapperElement?.querySelector(".next-prev-buttons--next-button") as HTMLElement
    nextBtn.click()
  })
}

export function registerGotItemEvent(itemGetter: () => Promise<SetInfoItem | null>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--got-it", async (e: Event) => {
    e.stopPropagation()

    const item = await itemGetter()
    if (!item) return // TODO: Notice problem.

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionForcedDone)
      .then(() => {})
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })

    const gotItemButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = gotItemButton.closest(".flash-card-wrapper")
    const nextBtn: HTMLElement = wrapperElement?.querySelector(".next-prev-buttons--next-button") as HTMLElement
    nextBtn.click()
  })
}

export function registerStarEvent(itemGetter: () => Promise<SetInfoItem | null>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--star", async (e: Event) => {
    e.stopPropagation()

    const item = await itemGetter()
    if (!item) return // TODO: Notice problem.

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionStar)
      .then(() => {})
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })
  })
}

export function registerSelectAnswerEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .answer-btn", async (e: Event) => {
    e.stopPropagation()

    const answerBtn = e.target as Element
    answerBtn?.classList.toggle("selected")
  })
}

export function registerCheckAnswerEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .check--btn", async (e: Event) => {
    e.stopPropagation()

    const checkBtn = e.target as Element
    const wrapperElement: HTMLElement | null = checkBtn.closest(".qna-card-wrapper")
    const answersData = wrapperElement?.getAttribute("data-answers") || ""
    const answerElements = wrapperElement?.querySelectorAll(".answer-btn")
    const answers = JSON.parse(decodeBase64(answersData))

    answerElements?.forEach((answer, idx) => {
      if (!answers) return
      if (answers[idx].isCorrect) {
        answer.classList.add("correct")
      }
      if (answer.classList.contains("selected") && !answers[idx].isCorrect) {
        answer.classList.add("incorrect")
      }
    })
  })
}
