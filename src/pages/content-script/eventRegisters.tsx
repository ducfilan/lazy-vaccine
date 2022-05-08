import * as React from "react"
import { addDynamicEventListener, htmlStringToHtmlNode } from "@/background/DomManipulator"
import { formatString } from "@/common/utils/stringUtils"
import { renderToString } from "react-dom/server"
import { toTemplateValues } from "./templateHelpers"
import { FlashCardTemplate } from "@/background/templates/Flashcard"
import { SetInfoItem } from "@/common/types/types"
import { sendItemInteractionsMessage } from "./messageSenders"
import { ItemsInteractionIgnore } from "@/common/consts/constants"

export function registerFlipCardEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--content", (e: Event) => {
    e.stopPropagation()

    const cardElement = e.target as Element
    cardElement.closest(".flash-card-wrapper")?.classList.toggle("is-flipped")
  })
}

export function registerNextItemEvent(nextItemGetter: () => Promise<SetInfoItem | null>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--next-button", async (e: Event) => {
    e.stopPropagation()

    const nextItem = await nextItemGetter()
    if (!nextItem) return // TODO: Notice problem.

    const nextButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = nextButton.closest(".lazy-vaccine")

    const newItemNode = htmlStringToHtmlNode(
      formatString(
        renderToString(<FlashCardTemplate />),
        toTemplateValues(nextItem, { setId: nextItem.setId, setTitle: nextItem.setTitle })
      )
    )

    wrapperElement?.replaceWith(newItemNode)
  })
}

export function registerPrevItemEvent(prevItemGetter: () => SetInfoItem | null) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--prev-button", async (e: Event) => {
    e.stopPropagation()

    const prevButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = prevButton.closest(".lazy-vaccine")

    const prevItem = prevItemGetter()
    if (!prevItem) return

    const newItemNode = htmlStringToHtmlNode(
      formatString(
        renderToString(<FlashCardTemplate />),
        toTemplateValues(prevItem, { setId: prevItem.setId, setTitle: prevItem.setTitle })
      )
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

export function registerIgnoreEvent(itemGetter: () => Promise<SetInfoItem | null>, nextItemGetter: () => Promise<SetInfoItem | null>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--ignore", async (e: Event) => {
    e.stopPropagation()

    const item = await itemGetter()
    if (!item) return // TODO: Notice problem.

    try {
      await sendItemInteractionsMessage(item.setId, item._id, ItemsInteractionIgnore)
    } catch (error) {
      // TODO: handle error case.
      console.error(error)
    }

    const nextItem = await nextItemGetter()
    if (!nextItem) return // TODO: Notice problem.

    const ignoreButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = ignoreButton.closest(".lazy-vaccine")

    const newItemNode = htmlStringToHtmlNode(
      formatString(
        renderToString(<FlashCardTemplate />),
        toTemplateValues(nextItem, { setId: nextItem.setId, setTitle: nextItem.setTitle })
      )
    )

    wrapperElement?.replaceWith(newItemNode)
  })
}
