import { addDynamicEventListener, htmlStringToHtmlNode } from "@/background/DomManipulator"
import { decodeBase64, formatString } from "@/common/utils/stringUtils"
import { generateTemplateExtraValues, toTemplateValues } from "./templateHelpers"
import { SetInfo, SetInfoItem } from "@/common/types/types"
import { sendInteractItemMessage } from "./messageSenders"
import {
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionNext,
  ItemsInteractionStar,
  ItemTypes,
} from "@/common/consts/constants"
import { getTemplate } from "@/background/PageInjector"
import { generateNumbersArray, shuffleArray } from "@/common/utils/arrayUtils"

export function registerFlipCardEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--content", (e: Event) => {
    e.stopPropagation()

    const cardElement = e.target as Element
    cardElement.closest(".flash-card-wrapper")?.classList.toggle("is-flipped")
  })
}

export function registerNextItemEvent(
  nextItemGetter: () => Promise<SetInfoItem | null>,
  itemGetter: () => SetInfoItem | null,
  setGetter: () => SetInfo | null
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--next-button", async (e: Event) => {
    e.stopPropagation()
    debugger

    if (e.isTrusted) {
      const currentItem = itemGetter()
      if (!currentItem) return // TODO: Notice problem.

      sendInteractItemMessage(currentItem.setId, currentItem._id, ItemsInteractionNext).catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })
    }

    const nextItem = await nextItemGetter()
    if (!nextItem) return // TODO: Notice problem.

    const nextButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = nextButton.closest(".lazy-vaccine")

    const currentSet = setGetter()
    if (!currentSet) throw new Error("cannot get set")

    const itemToDisplay = itemToDisplayItem(nextItem, currentSet)

    const templateValues = toTemplateValues(itemToDisplay, generateTemplateExtraValues(itemToDisplay))

    const newItemNode = htmlStringToHtmlNode(formatString(getTemplate(itemToDisplay.type), templateValues))

    wrapperElement?.replaceWith(newItemNode)
  })
}

/**
 * Turn the original item into an item to be displayed when injected. E.g. Term-Def item can be changed to Q and A item to test.
 * @param item: Original item
 * @param setInfo: Set information of the item.
 */
function itemToDisplayItem(item: SetInfoItem, setInfo: SetInfo): SetInfoItem {
  switch (item.type) {
    case ItemTypes.QnA.value:
      return item

    case ItemTypes.TermDef.value:
      // TODO: Need to add more logic to determine.
      const randomShouldGetTermDef = shuffleArray([0, 1])[0] == 0
      if (randomShouldGetTermDef) {
        return item
      }
      return turnItemToQuestionAndAnswersItem(item, setInfo)

    default:
      return item
  }
}

function turnItemToQuestionAndAnswersItem(nextItem: SetInfoItem, setInfo: SetInfo | null): SetInfoItem {
  let qaItem = {
    _id: nextItem._id,
    type: ItemTypes.QnA.value,
    setTitle: setInfo?.name,
  } as SetInfoItem

  switch (nextItem.type) {
    case ItemTypes.TermDef.value:
      const minimumTermDefItemsCountToFormQnA = 4

      const termDefItems = setInfo?.items?.filter((item) => item.type === ItemTypes.TermDef.value)
      if (!termDefItems || termDefItems.length < minimumTermDefItemsCountToFormQnA) {
        throw new Error("not enough term definition items to form Q and A item")
      }

      // TODO: Need to add more logic to determine.
      const randomShouldGetTermAsQuestion = shuffleArray([0, 1])[0] == 0

      if (randomShouldGetTermAsQuestion) {
        const randomDefinitions = getRandomDefinitions(termDefItems, minimumTermDefItemsCountToFormQnA)
          .filter((d) => d != nextItem.definition)
          .slice(0, minimumTermDefItemsCountToFormQnA - 1) // Prevent random items duplicate with next item case.
        qaItem.question = nextItem.term

        qaItem.answers = shuffleArray([
          ...randomDefinitions.map((d) => ({ answer: d })),
          { answer: nextItem.definition, isCorrect: true },
        ])
      } else {
        const randomTerms = getRandomTerms(termDefItems, minimumTermDefItemsCountToFormQnA)
          .filter((t) => t != nextItem.term)
          .slice(0, minimumTermDefItemsCountToFormQnA - 1) // Prevent random items duplicate with next item case.
        qaItem.question = nextItem.definition

        qaItem.answers = shuffleArray([
          ...randomTerms.map((t) => ({ answer: t })),
          { answer: nextItem.term, isCorrect: true },
        ])
      }

      break

    default:
      return nextItem
  }

  return qaItem
}

function getRandomTerms(items: SetInfoItem[], size: number): string[] {
  return getRandomPositions(items.length, size).map((i) => items[i].term)
}

function getRandomDefinitions(items: SetInfoItem[], size: number): string[] {
  return getRandomPositions(items.length, size).map((i) => items[i].definition)
}

function getRandomPositions(total: number, size: number): number[] {
  if (total < size) throw new Error("not enough items")

  return shuffleArray(generateNumbersArray(total)).slice(0, size)
}

export function registerPrevItemEvent(
  prevItemGetter: () => SetInfoItem | null,
  itemGetter: () => SetInfoItem | null,
  setInfo: () => SetInfo | null
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--prev-button", async (e: Event) => {
    e.stopPropagation()

    if (e.isTrusted) {
      const currentItem = itemGetter()
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

    const currentSet = setInfo()
    if (!currentSet) throw new Error("cannot get set")

    const itemToDisplay = itemToDisplayItem(prevItem, currentSet)

    const templateValues = toTemplateValues(itemToDisplay, generateTemplateExtraValues(itemToDisplay))

    const newItemNode = htmlStringToHtmlNode(formatString(getTemplate(itemToDisplay.type), templateValues))
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

export function registerNextSetEvent(preProcess: () => Promise<void>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card-next-set-link", async (e: Event) => {
    e.preventDefault()
    e.stopPropagation()

    await preProcess()

    const nextSetButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = nextSetButton.closest(".lazy-vaccine")

    toggleHiddenPopover(wrapperElement)
    clickNextItemButton(wrapperElement)
  })
}

function toggleHiddenPopover(wrapperElement: HTMLElement | null) {
  wrapperElement?.querySelector(".ant-popover")?.classList.toggle("ant-popover-hidden")
}

function clickNextItemButton(wrapperElement: HTMLElement | null) {
  const nextBtn: HTMLElement = wrapperElement?.querySelector(".next-prev-buttons--next-button") as HTMLElement
  nextBtn.click()
}

export function registerIgnoreEvent(
  itemGetter: () => SetInfoItem | null,
  updateItemInteraction: (itemId: string) => void
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--ignore", async (e: Event) => {
    e.stopPropagation()

    const item = itemGetter()
    if (!item) return // TODO: Notice problem.

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionIgnore)
      .then(() => updateItemInteraction(item._id))
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })

    const ignoreButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = ignoreButton.closest(".lazy-vaccine")
    clickNextItemButton(wrapperElement)
  })
}

export function registerGotItemEvent(
  itemGetter: () => SetInfoItem | null,
  updateItemInteraction: (itemId: string) => void
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--got-it", async (e: Event) => {
    e.stopPropagation()

    const item = itemGetter()
    if (!item) return // TODO: Notice problem.

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionForcedDone)
      .then(() => updateItemInteraction(item._id))
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })

    const gotItemButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = gotItemButton.closest(".lazy-vaccine")
    clickNextItemButton(wrapperElement)
  })
}

export function registerStarEvent(
  itemGetter: () => SetInfoItem | null,
  updateItemInteraction: (itemId: string) => void
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--star", async (e: Event) => {
    e.stopPropagation()
    const starBtn = e.target as Element
    starBtn?.classList.toggle("stared")

    const item = itemGetter()
    if (!item) return // TODO: Notice problem.

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionStar)
      .then(() => updateItemInteraction(item._id))
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
