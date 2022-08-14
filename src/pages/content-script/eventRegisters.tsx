import { addDynamicEventListener, htmlStringToHtmlNode } from "@/background/DomManipulator"
import { decodeBase64, formatString, getMainContent, takeFirstLine } from "@/common/utils/stringUtils"
import { generateTemplateExtraValues, toTemplateValues } from "./templateHelpers"
import { SetInfo, SetInfoItem } from "@/common/types/types"
import {
  sendInteractItemMessage,
  sendPronounceMessage,
  sendSetLocalSettingMessage,
  sendSignUpMessage,
} from "./messageSenders"
import {
  AppBasePath,
  AppPages,
  InjectWrapperClassName,
  ItemsInteractionAnswerCorrect,
  ItemsInteractionAnswerIncorrect,
  ItemsInteractionFlip,
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionNext,
  ItemsInteractionPrev,
  ItemsInteractionStar,
  ItemTypes,
} from "@/common/consts/constants"
import { getTemplate } from "@/background/PageInjector"
import { generateNumbersArray, isArraysEqual, shuffleArray } from "@/common/utils/arrayUtils"
import { redirectToUrlInNewTab } from "@/common/utils/domUtils"

export function registerFlipCardEvent() {
  const flipCard = (e: Event) => {
    let cardFace = e.target as HTMLElement
    if (!cardFace.classList.contains("card--face")) {
      cardFace = cardFace.closest(".card--face") as HTMLElement
    }
    const wrapperElement: HTMLElement = cardFace.closest(InjectWrapperClassName)!

    sendInteractItemMessage(wrapperElement.dataset.setid!, wrapperElement.dataset.itemid!, ItemsInteractionFlip).catch(
      (error) => {
        // TODO: handle error case.
        console.error(error)
      }
    )

    e.stopPropagation()

    const faceToDisplayClass = cardFace.classList.contains("card--face--front")
      ? ".card--face--back"
      : ".card--face--front"

    const faceToDisplay = cardFace.parentElement?.querySelector<HTMLElement>(faceToDisplayClass)!
    cardFace.parentElement?.style.setProperty("height", faceToDisplay?.clientHeight + "px")

    cardFace.querySelector<HTMLElement>(".card-item--top-bar-wrapper")!.style.display = "none"
    faceToDisplay.querySelector<HTMLElement>(".card-item--top-bar-wrapper")!.style.display = "grid"

    cardFace.closest(".flash-card-wrapper")?.classList.toggle("is-flipped")
  }

  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card .card--face .card--content", flipCard)
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card-item--top-bar-wrapper .btn-flip", flipCard)
}

export function registerNextItemEvent(
  nextItemGetter: () => Promise<SetInfoItem | null>,
  itemGetter: () => SetInfoItem | null,
  setGetter: () => SetInfo | null
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--next-button", async (e: Event) => {
    e.stopPropagation()

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
    const wrapperElement: HTMLElement | null = nextButton.closest(InjectWrapperClassName)

    const currentSet = setGetter()
    if (!currentSet) throw new Error("cannot get set")

    const itemToDisplay = itemToDisplayItem(nextItem, currentSet)

    toTemplateValues(itemToDisplay, generateTemplateExtraValues(itemToDisplay))
      .then((templateValues) => {
        getTemplate(itemToDisplay.type).then((template) => {
          const newItemNode = htmlStringToHtmlNode(formatString(template, templateValues))

          wrapperElement?.replaceWith(newItemNode)
        })
      })
      .catch((error) => {
        // There is some error when getting the next item, trigger next item.
        console.error(error)
      })
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
    setId: setInfo?._id,
    setTitle: setInfo?.name,
  } as SetInfoItem

  switch (nextItem.type) {
    case ItemTypes.TermDef.value:
      const minimumTermDefItemsCountToFormQnA = 4

      const termDefItems = setInfo?.items?.filter((item) => item.type === ItemTypes.TermDef.value)
      if (!termDefItems || termDefItems.length < minimumTermDefItemsCountToFormQnA) {
        // Not enough term definition items to form Q and A item
        return nextItem
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

    const prevButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = prevButton.closest(InjectWrapperClassName)

    const prevItem = prevItemGetter()
    if (!prevItem) return

    if (e.isTrusted) {
      sendInteractItemMessage(prevItem.setId, prevItem._id, ItemsInteractionPrev).catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })
    }

    const currentSet = setInfo()
    if (!currentSet) throw new Error("cannot get set")

    const itemToDisplay = itemToDisplayItem(prevItem, currentSet)

    toTemplateValues(itemToDisplay, generateTemplateExtraValues(itemToDisplay))
      .then((templateValues) => {
        getTemplate(itemToDisplay.type).then((template) => {
          const newItemNode = htmlStringToHtmlNode(formatString(template, templateValues))

          wrapperElement?.replaceWith(newItemNode)
        })
      })
      .catch((error) => {
        // There is some error when getting the next item, trigger next item.
        console.error(error)
      })
  })
}

export function registerMorePopoverEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .inject-card-more-button", (e: Event) => {
    e.stopPropagation()

    const moreButton = e.target as HTMLElement
    const wrapperElement: HTMLElement = moreButton.closest(InjectWrapperClassName)!
    toggleHiddenPopover(wrapperElement)

    wrapperElement.style.zIndex = isPopoverHidden(wrapperElement) ? "2" : "9999"
  })

  document.addEventListener("mouseup", function (e: MouseEvent) {
    const target = e.target as HTMLElement
    const wrapperElements: NodeListOf<HTMLElement> = document.querySelectorAll(".ant-popover")
    wrapperElements.forEach((wrapperElement) => {
      if (!wrapperElement.contains(target) && !isMoreButton(target)) {
        hidePopover(wrapperElement.closest(InjectWrapperClassName))
      }
    })
  })
}

export function registerHoverBubblePopoverEvent() {
  addDynamicEventListener(document.body, "mouseover", ".lazy-vaccine-bubble .bubble-img", (e: Event) => {
    e.stopPropagation()

    const moreButton = e.target as HTMLElement
    const wrapperElement: HTMLElement = moreButton.closest(".lazy-vaccine-bubble")!
    showPopover(wrapperElement)

    wrapperElement.style.zIndex = isPopoverHidden(wrapperElement) ? "2" : "9999"
  })

  document.addEventListener("mouseup", function (e: MouseEvent) {
    const target = e.target as HTMLElement
    const wrapperElements: NodeListOf<HTMLElement> = document.querySelectorAll(".ant-popover")
    wrapperElements.forEach((wrapperElement) => {
      if (!wrapperElement.contains(target) && !isMoreButton(target)) {
        hidePopover(wrapperElement.closest(".lazy-vaccine-bubble"))
      }
    })
  })
}

const isMoreButton = (element: HTMLElement) =>
  element.classList.contains("inject-card-more-button") || element.closest(".inject-card-more-button")

export function registerNextSetEvent(preProcess: () => Promise<void>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .inject-card-next-set-link", async (e: Event) => {
    e.preventDefault()
    e.stopPropagation()

    await preProcess()

    const nextSetButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = nextSetButton.closest(InjectWrapperClassName)

    toggleHiddenPopover(wrapperElement)
    clickNextItemButton(wrapperElement)
  })
}

function toggleHiddenPopover(wrapperElement: HTMLElement | null) {
  wrapperElement?.querySelector(".ant-popover")?.classList.toggle("ant-popover-hidden")
}

function hidePopover(wrapperElement: HTMLElement | null) {
  wrapperElement?.querySelector(".ant-popover")?.classList.add("ant-popover-hidden")
}

function showPopover(wrapperElement: HTMLElement | null) {
  wrapperElement?.querySelector(".ant-popover")?.classList.remove("ant-popover-hidden")
}

const isPopoverHidden = (wrapperElement: HTMLElement) =>
  wrapperElement.querySelector(".ant-popover")?.classList.contains("ant-popover-hidden")

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
    const wrapperElement: HTMLElement | null = ignoreButton.closest(InjectWrapperClassName)
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
    const wrapperElement: HTMLElement | null = gotItemButton.closest(InjectWrapperClassName)
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

    const wrapperElement: HTMLElement = answerBtn.closest(".qna-card-wrapper")!

    const answersData = wrapperElement?.getAttribute("data-answers") || ""
    const correctAnswersCount = JSON.parse(decodeBase64(answersData)).filter((answer: any) => answer.isCorrect).length

    const answerElements = wrapperElement?.querySelectorAll(".answer-btn")
    if (correctAnswersCount == 1) {
      answerElements.forEach((answer) => {
        answer.classList.remove("selected")
      })
    }

    answerBtn?.classList.toggle("selected")
  })
}

export function registerCheckAnswerEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .check--btn", async (e: Event) => {
    e.stopPropagation()

    const checkBtn = e.target as Element
    const wrapperElement: HTMLElement = checkBtn.closest(InjectWrapperClassName)!
    const contentWrapperElement: HTMLElement | null = checkBtn.closest(".qna-card-wrapper")
    const answerElements = contentWrapperElement?.querySelectorAll(".answer-btn")

    const answersData = contentWrapperElement?.getAttribute("data-answers") || ""
    const answers = JSON.parse(decodeBase64(answersData))

    const selectedAnswers = Array.from(answerElements || [])
      .filter((answer) => answer.classList.contains("selected"))
      .map((answer) => answer.innerHTML)
    const correctAnswers = answers.filter((answer: any) => answer.isCorrect).map((answer: any) => answer.answer)

    const isAnsweredCorrect = isArraysEqual(selectedAnswers, correctAnswers)
    const isAnswered = wrapperElement.dataset.answered === "true"

    !isAnswered &&
      wrapperElement.dataset.setid &&
      wrapperElement.dataset.itemid &&
      sendInteractItemMessage(
        wrapperElement.dataset.setid!,
        wrapperElement.dataset.itemid!,
        isAnsweredCorrect ? ItemsInteractionAnswerCorrect : ItemsInteractionAnswerIncorrect
      )
        .then(() => {
          wrapperElement.dataset.answered = "true"
        })
        .catch((error) => {
          // TODO: handle error case.
          console.error(error)
        })

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

export function registerSelectEvent() {
  const wrapperSelector = ".select-menu"

  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} ${wrapperSelector} .select-btn`,
    async (e: Event) => {
      const selectBtn = e.target as Element
      selectBtn.closest(wrapperSelector)!.classList.toggle("active")
    }
  )

  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} ${wrapperSelector} .option`,
    async (e: Event) => {
      const option = e.target as HTMLElement

      let selectedOptionKey = option.dataset.key
      let selectedOptionLabel = option.innerText

      let wrapper = option.closest(wrapperSelector) as HTMLElement
      const settingKey = wrapper.dataset.settingKey

      settingKey && selectedOptionKey && sendSetLocalSettingMessage(settingKey, selectedOptionKey)
      ;(wrapper?.querySelector(".sBtn-text") as HTMLElement).innerText = selectedOptionLabel
      wrapper?.classList.remove("active")
    }
  )
}

export function registerSuggestionSearchButtonClickEvent() {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .suggestion-card .ant-input-search-button`,
    async (e: Event) => {
      const button = e.target as HTMLInputElement
      const keyword = (button.closest(".ant-input-wrapper")?.querySelector(".ant-input") as HTMLInputElement).value

      redirectToUrlInNewTab(
        `${chrome.runtime.getURL(AppBasePath)}${AppPages.Sets.path}?keyword=${encodeURIComponent(keyword)}`
      )
    }
  )

  addDynamicEventListener(
    document.body,
    "keydown",
    `${InjectWrapperClassName} .suggestion-card .ant-input`,
    async (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const keyword = (e.target as HTMLInputElement).value

        redirectToUrlInNewTab(
          `${chrome.runtime.getURL(AppBasePath)}${AppPages.Sets.path}?keyword=${encodeURIComponent(keyword)}`
        )
      }
    }
  )
}

export function registerSuggestionLoginButtonClickEvent(callback: () => Promise<void>) {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .suggestion-card .login-button`,
    async (e: Event) => {
      const button = e.target as HTMLInputElement
      button.disabled = true

      sendSignUpMessage()
        .then(callback)
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          button.disabled = false
        })
    }
  )
}

export function registerPronounceButtonClickEvent() {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .card-item--top-bar-wrapper .btn-pronounce`,
    async (e: Event) => {
      e.stopPropagation()

      const button = e.target as HTMLInputElement
      const cardContentElem = button.closest(".card--face")?.querySelector(".card--content") as HTMLElement
      const text = takeFirstLine(getMainContent(cardContentElem.innerText))
      const langCode = cardContentElem.dataset.lang

      text &&
        langCode &&
        sendPronounceMessage(text, langCode)
          .then()
          .catch((error) => {
            console.error(error)
          })
    }
  )
}

export function registerRemoveCardButtonClickEvent() {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .disclaimer-info .buttons .close`,
    async (e: Event) => {
      e.stopPropagation()

      const button = e.target as HTMLInputElement
      button.closest(InjectWrapperClassName)?.remove()
    }
  )
}

export function registerHoverCardEvent() {
  addDynamicEventListener(document.body, "mouseover", InjectWrapperClassName, async (e: Event) => {
    e.stopPropagation()
    document.querySelector(".lazy-vaccine-bubble .bubble-img")?.classList.add("lazy-vaccine-hidden")
    document.querySelector(".lazy-vaccine-bubble .bubble-img-wan")?.classList.remove("lazy-vaccine-hidden")
  })

  addDynamicEventListener(document.body, "mouseout", InjectWrapperClassName, async (e: Event) => {
    e.stopPropagation()
    document.querySelector(".lazy-vaccine-bubble .bubble-img")?.classList.remove("lazy-vaccine-hidden")
    document.querySelector(".lazy-vaccine-bubble .bubble-img-wan")?.classList.add("lazy-vaccine-hidden")
  })
}
