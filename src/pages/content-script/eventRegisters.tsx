import { addDynamicEventListener, htmlStringToHtmlNode } from "@/background/DomManipulator"
import { decodeBase64, formatString, getMainContent, takeFirstLine } from "@/common/utils/stringUtils"
import {
  generateTemplateExtraValues,
  getRecommendationTemplateValues,
  getTemplateFromType,
  toTemplateValues,
} from "./templateHelpers"
import { SetInfo, SetInfoItem } from "@/common/types/types"
import {
  sendInteractItemMessage,
  sendInteractSetMessage,
  sendPronounceMessage,
  sendSetLocalSettingMessage,
  sendSignUpMessage,
  sendTrackingMessage,
  sendUndoInteractSetMessage,
} from "./messageSenders"
import {
  AppBasePath,
  AppPages,
  i18n,
  InjectWrapperClassName,
  InteractionDislike,
  InteractionLike,
  InteractionSubscribe,
  ItemsInteractionAnswerCorrect,
  ItemsInteractionAnswerIncorrect,
  ItemsInteractionCopyText,
  ItemsInteractionFlip,
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionNext,
  ItemsInteractionPrev,
  ItemsInteractionReviewStar,
  ItemsInteractionStar,
  ItemTypes,
  OtherItemTypes,
  SetTypeNormal,
  SetTypeReviewStarredItems,
} from "@/common/consts/constants"
import { generateNumbersArray, isArraysEqual, shuffleArray } from "@/common/utils/arrayUtils"
import { redirectToUrlInNewTab, writeToClipboard } from "@/common/utils/domUtils"

export function registerFlipCardEvent() {
  const flipCard = (e: Event) => {
    const cardFace = (e.target as HTMLElement).closest<HTMLElement>(".card--face")!
    const wrapperElement: HTMLElement = cardFace.closest(InjectWrapperClassName)!

    sendInteractItemMessage(wrapperElement.dataset.setId!, wrapperElement.dataset.itemId!, ItemsInteractionFlip).catch(
      (error) => {
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

  const copyCardText = (e: Event) => {
    const cardFace = (e.target as HTMLElement).closest<HTMLElement>(".card--face")!
    const wrapperElement: HTMLElement = cardFace.closest(InjectWrapperClassName)!

    const { setId, itemId } = wrapperElement.dataset
    sendInteractItemMessage(setId!, itemId!, ItemsInteractionCopyText).catch((error) => {
      console.error(error)
    })

    writeToClipboard(cardFace.innerText).then(() => {
      wrapperElement
        .querySelector<HTMLElement>(".btn-copy")
        ?.setAttribute("data-tooltip", `${i18n("common_copied")}: ${cardFace.innerText}`)
    })
  }

  addDynamicEventListener(document.body, "click", ".lazy-vaccine .flash-card .card--face .card--content", flipCard)
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card-item--top-bar-wrapper .btn-flip", flipCard)
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card-item--top-bar-wrapper .btn-copy", copyCardText)
}

export function registerNextItemEvent(
  nextItemGetter: () => Promise<SetInfoItem | null>,
  itemGetter: () => Promise<SetInfoItem | null>,
  setGetter: () => SetInfo | null,
  extraValues: { [key: string]: any }
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--next-button", async (e: Event) => {
    e.stopPropagation()

    const nextButton = e.target as HTMLElement
    const wrapperElement: HTMLElement = nextButton.closest(InjectWrapperClassName)!

    showLoadingCard(wrapperElement)

    const currentItem = await itemGetter()
    if (!currentItem) return // TODO: Notice problem.

    sendInteractItemMessage(currentItem.setId, currentItem._id, ItemsInteractionNext).catch((error) => {
      // TODO: handle error case.
      console.error(error)
    })

    if (currentItem.setType === SetTypeReviewStarredItems) {
      sendInteractItemMessage(currentItem.setId, currentItem._id, ItemsInteractionReviewStar).catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })
    }

    let nextItem: SetInfoItem | null = null
    try {
      nextItem = await nextItemGetter()

      if (extraValues.isNeedRecommendationGetter()) {
        nextItem = {
          type: OtherItemTypes.SuggestionSets.value,
        } as SetInfoItem
      }
    } catch (error) {
      console.error(error)
    }

    if (!nextItem) return // TODO: Notice problem.

    const currentSet = setGetter()
    if (!currentSet) throw new Error("cannot get set")

    const itemToDisplay = itemToDisplayItem(nextItem, currentSet)

    const getTemplateValues = () => {
      if (extraValues.isNeedRecommendationGetter()) {
        return getRecommendationTemplateValues(currentSet, extraValues.identityGetter())
      }

      return toTemplateValues(itemToDisplay, generateTemplateExtraValues(itemToDisplay))
    }

    getTemplateValues()
      .then((templateValues) => {
        let type = itemToDisplay.type

        getTemplateFromType(type)
          .then((template) => {
            const newItemNode = htmlStringToHtmlNode(formatString(template, templateValues))
            wrapperElement?.replaceWith(newItemNode)
          })
          .catch((error) => {
            console.error(error)
          })
      })
      .catch((error) => {
        // There is some error when getting the next item, trigger next item.
        console.error(error)
      })
  })
}

function showLoadingCard(wrapperElement: HTMLElement) {
  wrapperElement?.querySelector(".ant-skeleton")?.classList.remove("lazy-vaccine-hidden")
  wrapperElement?.querySelector(".card-wrapper")?.classList.add("lazy-vaccine-hidden")
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
    isStared: nextItem.isStared,
    type: ItemTypes.QnA.value,
    setId: setInfo?._id || nextItem.setId, // Fallback in case setInfo is a dynamic set (review starred items set)
    setTitle: setInfo?.name,
    setType: setInfo?.setType,
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
  prevItemGetter: () => Promise<SetInfoItem | null>,
  itemGetter: () => Promise<SetInfoItem | null>,
  setInfo: () => SetInfo | null
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .next-prev-buttons--prev-button", async (e: Event) => {
    e.stopPropagation()

    const prevButton = e.target as HTMLElement
    const wrapperElement: HTMLElement = prevButton.closest(InjectWrapperClassName)!

    showLoadingCard(wrapperElement)

    const prevItem = await prevItemGetter()
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
        getTemplateFromType(itemToDisplay.type)
          .then((template) => {
            const newItemNode = htmlStringToHtmlNode(formatString(template, templateValues))

            wrapperElement?.replaceWith(newItemNode)
          })
          .catch((error) => {
            console.error(error)
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

    sendTrackingMessage("Click more button on inject card", null).catch((error) => {
      console.error(error)
    })

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
  let isHovered = false

  addDynamicEventListener(document.body, "mouseover", ".lazy-vaccine-bubble .bubble-img", (e: Event) => {
    !isHovered &&
      sendTrackingMessage("Hover inject bubble", null).catch((error) => {
        console.error(error)
      })
    isHovered = true
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
        isHovered = false
      }
    })
  })
}

const isMoreButton = (element: HTMLElement) =>
  element.classList.contains("inject-card-more-button") || element.closest(".inject-card-more-button")

export function registerHoverBubbleCloseEvent() {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine-bubble .close-btn", (e: Event) => {
    sendTrackingMessage("Close inject bubble", null).catch((error) => {
      console.error(error)
    })

    e.stopPropagation()

    const closeButton = e.target as HTMLElement
    const wrapperElement: HTMLElement = closeButton.closest(".lazy-vaccine-bubble")!

    wrapperElement.remove()
  })
}

export function registerNextSetEvent(preProcess: () => Promise<void>) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .inject-card-next-set-link", async (e: Event) => {
    e.preventDefault()
    e.stopPropagation()

    const nextSetButton = e.target as HTMLElement
    const wrapperElement: HTMLElement = nextSetButton.closest(InjectWrapperClassName)!

    showLoadingCard(wrapperElement)

    try {
      await preProcess()
    } catch (error) {
      console.error(error)
      return
    }

    sendTrackingMessage("Click next set link", {
      setId: wrapperElement?.dataset.setId,
      itemId: wrapperElement?.dataset.itemId,
    }).catch((error) => {
      console.error(error)
    })

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
  itemGetter: () => Promise<SetInfoItem | null>,
  recommendationSetter: (value: boolean) => void,
  updateItemInteraction: (itemId: string) => void
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--ignore", async (e: Event) => {
    e.stopPropagation()

    const ignoreButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = ignoreButton.closest(InjectWrapperClassName)

    const item = await itemGetter()
    if (!item) {
      recommendationSetter(true)
      clickNextItemButton(wrapperElement)
      return
    }

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionIgnore)
      .then(() => updateItemInteraction(item._id))
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })
    clickNextItemButton(wrapperElement)
  })
}

export function registerGotItemEvent(
  itemGetter: () => Promise<SetInfoItem | null>,
  recommendationSetter: (value: boolean) => void,
  updateItemInteraction: (itemId: string) => void
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--got-it", async (e: Event) => {
    e.stopPropagation()

    const gotItemButton = e.target as HTMLElement
    const wrapperElement: HTMLElement | null = gotItemButton.closest(InjectWrapperClassName)

    const item = await itemGetter()
    if (!item) {
      recommendationSetter(true)
      clickNextItemButton(wrapperElement)
      return
    }

    sendInteractItemMessage(item.setId, item._id, ItemsInteractionForcedDone)
      .then(() => updateItemInteraction(item._id))
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })
    clickNextItemButton(wrapperElement)
  })
}

export function registerStarEvent(
  itemGetter: () => Promise<SetInfoItem | null>,
  updateItemInteraction: (itemId: string) => void
) {
  addDynamicEventListener(document.body, "click", ".lazy-vaccine .card--interactions--star", async (e: Event) => {
    e.stopPropagation()
    const starBtn = (e.target as HTMLElement).closest("button")
    starBtn?.classList.toggle("stared")

    const item = await itemGetter()
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
      wrapperElement.dataset.setId &&
      wrapperElement.dataset.itemId &&
      sendInteractItemMessage(
        wrapperElement.dataset.setId!,
        wrapperElement.dataset.itemId!,
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

      settingKey &&
        selectedOptionKey &&
        sendSetLocalSettingMessage(settingKey, selectedOptionKey).catch((error) => {
          console.error(error)
        })
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

      redirectToUrlInNewTab(`${chrome.runtime.getURL(AppBasePath)}${AppPages.GettingStarted.path}?source=popup`)
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

export function registerTopBarCardButtonsClickEvent() {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .disclaimer-info .buttons .close`,
    async (e: Event) => {
      e.stopPropagation()

      const wrapperElement: HTMLElement = (e.target as HTMLElement).closest(InjectWrapperClassName)!
      const setId = wrapperElement.dataset.setId!
      const itemId = wrapperElement.dataset.itemId!

      sendTrackingMessage("Click close card button", { setId, itemId }).catch((error) => {
        console.error(error)
      })

      const button = e.target as HTMLInputElement
      button.closest(InjectWrapperClassName)?.remove()
    }
  )

  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .disclaimer-info .buttons .maximize`,
    async (e: Event) => {
      e.stopPropagation()
      const wrapperElement: HTMLElement = (e.target as HTMLElement).closest(InjectWrapperClassName)!

      const setId = wrapperElement.dataset.setId!
      const itemId = wrapperElement.dataset.itemId!

      sendTrackingMessage("Click maximize card button", { setId, itemId }).catch((error) => {
        console.error(error)
      })

      redirectToUrlInNewTab(`${chrome.runtime.getURL(AppBasePath)}${AppPages.SetDetail.path}`.replace(":setId", setId))
    }
  )

  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .disclaimer-info .buttons .minimize`,
    async (e: Event) => {
      e.stopPropagation()
      const wrapperElement: HTMLElement = (e.target as HTMLElement).closest(InjectWrapperClassName)!

      const setId = wrapperElement.dataset.setId!
      const itemId = wrapperElement.dataset.itemId!

      sendTrackingMessage("Click minimize card button", { setId, itemId }).catch((error) => {
        console.error(error)
      })

      const hiddenClassName = "lazy-vaccine-hidden"
      wrapperElement.querySelector(".card-wrapper")?.classList.toggle(hiddenClassName)
      wrapperElement.querySelector(".card--interactions")?.classList.toggle(hiddenClassName)
      wrapperElement.querySelector(".next-prev-buttons--wrapper")?.classList.toggle(hiddenClassName)
      wrapperElement.querySelector(".card-set-item-small")?.classList.toggle(hiddenClassName)
      wrapperElement.querySelector(".talking-shib-wrapper")?.classList.toggle(hiddenClassName)
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

export function registerSubscribeEvent(callback: Function) {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .card-set-item-small .subscribe-button`,
    async (e: Event) => {
      e.stopPropagation()
      const wrapperElement: HTMLElement = (e.target as HTMLElement).closest(InjectWrapperClassName)!

      const setId = wrapperElement.dataset.setId!
      const isSubscribed = (e.target as HTMLElement).closest("button")?.innerText === i18n("common_subscribe")

      if (isSubscribed) {
        ;(wrapperElement.querySelector(".subscribe-button > span:nth-child(2)") as HTMLElement).innerText =
          i18n("common_subscribe")
        sendTrackingMessage("Unsubscribe set from suggestion", { setId }).catch((error) => {
          console.error(error)
        })

        sendUndoInteractSetMessage(setId, InteractionSubscribe)
          .then(() => callback())
          .catch((error) => {
            // TODO: handle error case.
            console.error(error)
          })
      } else {
        ;(wrapperElement.querySelector(".subscribe-button > span:nth-child(2)") as HTMLElement).innerText =
          i18n("common_unsubscribe")
        sendTrackingMessage("Subscribe set from suggestion", { setId }).catch((error) => {
          console.error(error)
        })

        sendInteractSetMessage(setId, InteractionSubscribe)
          .then(() => callback())
          .catch((error) => {
            // TODO: handle error case.
            console.error(error)
          })
      }
    }
  )
}

export function registerLikeEvent(callback: Function) {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .card-set-item-small .like-button`,
    async (e: Event) => {
      e.stopPropagation()
      const wrapperElement: HTMLElement = (e.target as HTMLElement).closest(InjectWrapperClassName)!

      const setId = wrapperElement.dataset.setId!
      const isLiked = String(wrapperElement.dataset.isLiked?.toLowerCase()) == "true"
      const isDisliked = String(wrapperElement.dataset.isDislike?.toLowerCase()) == "true"

      wrapperElement.querySelectorAll(".dislike-button .anticon").forEach((el) => el.classList.remove("is-primary"))
      ;(e.target as HTMLElement).closest("button")?.querySelector(".anticon")?.classList.toggle("is-primary")

      if (isLiked) {
        sendTrackingMessage("Unlike set from suggestion", { setId }).catch((error) => {
          console.error(error)
        })

        sendUndoInteractSetMessage(setId, InteractionLike)
          .then(() => callback())
          .catch((error) => {
            // TODO: handle error case.
            console.error(error)
          })
      } else {
        sendTrackingMessage("Like set from suggestion", { setId }).catch((error) => {
          console.error(error)
        })

        if (isDisliked) await sendUndoInteractSetMessage(setId, InteractionDislike)

        sendInteractSetMessage(setId, InteractionLike)
          .then(() => callback())
          .catch((error) => {
            // TODO: handle error case.
            console.error(error)
          })
      }

      wrapperElement.dataset.isLiked = (!isLiked).toString()
    }
  )
}

export function registerDislikeEvent(callback: Function) {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .card-set-item-small .dislike-button`,
    async (e: Event) => {
      e.stopPropagation()
      const wrapperElement: HTMLElement = (e.target as HTMLElement).closest(InjectWrapperClassName)!

      const setId = wrapperElement.dataset.setId!
      const isLiked = String(wrapperElement.dataset.isLiked?.toLowerCase()) == "true"
      const isDisliked = String(wrapperElement.dataset.isDislike?.toLowerCase()) == "true"

      wrapperElement.querySelectorAll(".like-button .anticon").forEach((el) => el.classList.remove("is-primary"))
      ;(e.target as HTMLElement).closest("button")?.querySelector(".anticon")?.classList.toggle("is-primary")

      if (isDisliked) {
        sendTrackingMessage("UnDislike set from suggestion", { setId }).catch((error) => {
          console.error(error)
        })

        sendUndoInteractSetMessage(setId, InteractionDislike)
          .then(() => callback())
          .catch((error) => {
            // TODO: handle error case.
            console.error(error)
          })
      } else {
        sendTrackingMessage("Dislike set from suggestion", { setId }).catch((error) => {
          console.error(error)
        })

        if (isLiked) await sendUndoInteractSetMessage(setId, InteractionLike)

        sendInteractSetMessage(setId, InteractionDislike)
          .then(() => callback())
          .catch((error) => {
            // TODO: handle error case.
            console.error(error)
          })
      }

      wrapperElement.dataset.isDislike = (!isDisliked).toString()
    }
  )
}

export function registerReviewStarredItemsEvent(getItem: () => Promise<SetInfoItem | null>) {
  addDynamicEventListener(
    document.body,
    "click",
    `${InjectWrapperClassName} .lzv-btn-review-starred-items`,
    async (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      const reviewButton = e.target as HTMLElement
      const wrapperElement: HTMLElement = reviewButton.closest(InjectWrapperClassName)!

      showLoadingCard(wrapperElement)

      sendTrackingMessage("Review starred items").catch((error) => {
        console.error(error)
      })

      const item = await getItem()
      if (!item) return

      const templateValues = await toTemplateValues(item, generateTemplateExtraValues(item))

      getTemplateFromType(item.type)
        .then((template) => {
          const newItemNode = htmlStringToHtmlNode(formatString(template, templateValues))
          wrapperElement?.replaceWith(newItemNode)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  )
}
