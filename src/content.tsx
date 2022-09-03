import React from "react"

import "./background/templates/css/antd-wrapped.less"

import PageInjector from "./background/PageInjector"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { InjectionTargetsResponse, KeyValuePair, SetInfo, User } from "./common/types/types"
import { detectPageChanged, hrefComparer } from "./common/utils/domUtils"
import {
  sendClearCachedRandomSetMessage,
  sendGetRandomSubscribedSetSilentMessage,
  sendIdentityUserMessage,
  sendInteractItemMessage,
  sendTrackingMessage,
} from "./pages/content-script/messageSenders"
import {
  registerFlipCardEvent,
  registerMorePopoverEvent,
  registerNextItemEvent,
  registerNextSetEvent,
  registerPrevItemEvent,
  registerIgnoreEvent,
  registerGotItemEvent,
  registerStarEvent,
  registerSelectAnswerEvent,
  registerCheckAnswerEvent,
  registerSelectEvent,
  registerSuggestionSearchButtonClickEvent,
  registerSuggestionLoginButtonClickEvent,
  registerHoverBubblePopoverEvent,
  registerPronounceButtonClickEvent,
  registerTopBarCardButtonsClickEvent,
  registerHoverCardEvent,
  registerSubscribeEvent,
  registerLikeEvent,
  registerDislikeEvent,
} from "./pages/content-script/eventRegisters"
import { getHref, isSiteSupportedInjection } from "./pages/content-script/domHelpers"
import { shuffleArray } from "./common/utils/arrayUtils"
import {
  generateTemplateExtraValues,
  getNetworkErrorTemplateValues,
  getNotLoggedInTemplateValues,
  getNotSubscribedTemplateValues,
  getRecommendationTemplateValues,
  toTemplateValues,
} from "./pages/content-script/templateHelpers"
import {
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionShow,
  ItemsInteractionStar,
} from "./common/consts/constants"

import "@/background/templates/css/content.scss"

import { htmlStringToHtmlNode } from "./background/DomManipulator"
import { getInjectionTargets } from "./common/repo/injection-targets"
import { renderToString } from "react-dom/server"
import { FixedWidget } from "./background/templates/FixedWidget"
import { getRestrictedKeywords } from "./common/repo/restricted-keywords"
import { appearInPercent, getStorageSyncData } from "./common/utils/utils"
import CacheKeys from "./common/consts/cacheKeys"

const injectFixedWidgetBubble = () => {
  const node = htmlStringToHtmlNode(renderToString(<FixedWidget />))
  document.querySelector("body")?.prepend(node)
}

let randomItemIndexVisitMap: number[] = []
let setInfo: SetInfo | null
let currentItemPointer = 0
let itemsInPageInteractionMap: {
  [itemId: string]: string[]
} = {}

let isLoggedIn = false
let havingSubscribedSets = false
let lastError: any = null
let isNeedRecommendation = false
let identity: User

let allInjectors: PageInjector[] = []
let allInjectionTargets: InjectionTargetsResponse
let allIntervalIds: NodeJS.Timer[] = []

sendIdentityUserMessage()
  .then((user: User) => {
    identity = user
  })
  .catch((e) => console.error(e))
  .finally(() => {
    getRestrictedKeywords()
      .then((keywords: string[]) => {
        const href = getHref()
        if (keywords.every((keyword: string) => !href.includes(keyword))) {
          injectFixedWidgetBubble()
        }
      })
      .catch((err) => {
        console.error(err)
      })

    getInjectionTargets()
      .then((targets) => {
        allInjectionTargets = targets
        if (!isSiteSupportedInjection(targets, getHref())) return

        processInjection().finally(() => {
          const intervalId = detectPageChanged(processInjection, hrefComparer.bind({ targets }), allIntervalIds)
          allIntervalIds.push(intervalId)
        })
      })
      .catch((err) => {
        console.error(err)
      })
  })

async function processInjection() {
  console.debug("processInjection called")

  try {
    // Remove cache from background page (app's scope).
    await sendClearCachedRandomSetMessage()

    await initValues()

    removeOldCards()

    disconnectExistingObservers()
    const newInjectors = await injectCards()
    allInjectors.push(...newInjectors)
  } catch (error) {
    console.error(error)
    console.error("error when injecting set item")
  }
}

function disconnectExistingObservers() {
  if (!allInjectors) return

  allInjectors.forEach((injector, i) => {
    console.debug("getAllObservers: " + injector.getAllObservers().length)
    allInjectors.splice(i, 1)
    injector.getAllObservers().forEach((observer) => observer.stop())
  })
}

registerFlashcardEvents()

async function initValues() {
  try {
    currentItemPointer = 0
    havingSubscribedSets = false
    lastError = null

    setInfo = await sendGetRandomSubscribedSetSilentMessage()
    if (setInfo) {
      randomItemIndexVisitMap = shuffleArray(Array.from(Array(setInfo.items?.length || 0).keys()))
      isLoggedIn = true
      havingSubscribedSets = true

      setInfo.itemsInteractions?.map((itemInteractions) => {
        if ((itemInteractions.interactionCount.star || 0) % 2 == 0) {
          delete itemInteractions.interactionCount.star
        }

        itemsInPageInteractionMap[itemInteractions.itemId] = Object.keys(itemInteractions.interactionCount)
      })

      await determineIsNeedRecommendation()
    }
  } catch (error: any) {
    if (error?.error?.type === "NotSubscribedError") {
      console.debug("NotSubscribedError")
      havingSubscribedSets = false
      isLoggedIn = true
    } else if (error?.error?.type === "NotLoggedInError") {
      console.debug("NotLoggedInError")
      havingSubscribedSets = false
      isLoggedIn = false
    } else {
      lastError = error
      console.error(error)
    }
  }
}

/**
 * If the set got interacted more than 80 percent, then 30% of the time this set is displayed, will show a similar set to recommendation.
 * @returns true if the recommendation card should be displayed in the page.
 */
async function determineIsNeedRecommendation() {
  if (isNeedRecommendation) return

  try {
    const showItemCount = (await getStorageSyncData<number>(CacheKeys.showItemCount)) || 0
    const interactItemCount = (await getStorageSyncData<number>(CacheKeys.interactItemCount)) || 0
    const minimumShowedItemToStartRecommend = 100

    if (
      showItemCount > minimumShowedItemToStartRecommend &&
      interactItemCount / showItemCount < 0.02 &&
      appearInPercent(0.25)
    ) {
      console.debug("suggest after no interaction for a long time")
      sendTrackingMessage("Suggest from no interaction")
      isNeedRecommendation = true

      return
    }
  } catch (error) {
    console.error(error)
  }

  if (!setInfo) return

  setInfo.itemsInteractions?.forEach((i) => delete i.interactionCount[ItemsInteractionStar])
  setInfo.itemsInteractions = setInfo.itemsInteractions?.filter((i) => Object.keys(i).length > 0)

  const isInteractedMoreThan80Percent = (setInfo.itemsInteractions?.length || 0) > (setInfo.items?.length || 0) * 0.8
  isNeedRecommendation = isInteractedMoreThan80Percent && appearInPercent(0.2)
}

function removeOldCards() {
  console.debug("Removing old cards...")
  document.querySelectorAll(".lazy-vaccine").forEach((el) => el.remove())
}

async function injectCards(): Promise<PageInjector[]> {
  try {
    const injectionTargets = await new InjectionTargetFactory(getHref()).getTargets()
    console.debug("injectCards called, injectionTargets: " + injectionTargets.length)

    let injectors: PageInjector[] = []

    injectionTargets.forEach(async ({ rate, type, selector, newGeneratedElementSelector, siblingSelector, strict }) => {
      const injector = new PageInjector(rate, type, selector, newGeneratedElementSelector, siblingSelector, strict)

      injectors.push(injector)
    })

    await Promise.all(injectors.map((i) => i.waitInject(randomTemplateValues)))
    console.debug("all injection done!")

    return injectors
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
    return []
  }
}

const randomTemplateValues = async (increaseOnCall: boolean = false): Promise<KeyValuePair[]> => {
  console.debug(
    "randomTemplateValues called, isLoggedIn: " +
      isLoggedIn +
      ", havingSubscribedSets: " +
      havingSubscribedSets +
      ", items count: " +
      setInfo?.items?.length
  )

  if (lastError) {
    const networkErrorValues = await getNetworkErrorTemplateValues(lastError)

    if (networkErrorValues && networkErrorValues.length > 0) {
      return networkErrorValues
    }
  }

  if (!isLoggedIn) {
    return getNotLoggedInTemplateValues()
  }

  if (!havingSubscribedSets) {
    return getNotSubscribedTemplateValues()
  }

  if (isNeedRecommendation) {
    isNeedRecommendation = false
    return getRecommendationTemplateValues(setInfo, identity)
  }

  const item = getItemAtPointer(currentItemPointer)
  if (increaseOnCall) {
    currentItemPointer++

    if (isDisplayedAllItemsInSet()) {
      isNeedRecommendation = true
      processInjection()
      return []
    }
  }

  let templateValues: KeyValuePair[] = []
  if (!item) {
    isNeedRecommendation = true
    processInjection()
  } else {
    try {
      await sendInteractItemMessage(setInfo?._id || "", item?._id || "", ItemsInteractionShow)
      itemsInPageInteractionMap[item?._id] = [...(itemsInPageInteractionMap[item?._id] || []), ItemsInteractionShow]

      templateValues = await toTemplateValues(item, generateTemplateExtraValues(item))
    } catch (error) {
      console.error(templateValues)
    }
  }

  return templateValues
}

const isDisplayedAllItemsInSet = () => currentItemPointer + 1 >= (setInfo?.items?.length || 0)

function registerFlashcardEvents() {
  const nextItemGetter = async () => {
    const item = getItemAtPointer(++currentItemPointer)
    if (isDisplayedAllItemsInSet()) {
      isNeedRecommendation = true
      return null
    }

    return item
  }

  const itemGetter = () => {
    return getItemAtPointer(currentItemPointer)
  }

  const setGetter = () => {
    return setInfo
  }

  const recommendationSetter = (value: boolean) => (isNeedRecommendation = value)

  registerFlipCardEvent()

  registerSelectAnswerEvent()

  registerCheckAnswerEvent()

  registerIgnoreEvent(itemGetter, recommendationSetter, (itemId: string) => {
    itemsInPageInteractionMap[itemId] = [...(itemsInPageInteractionMap[itemId] || []), ItemsInteractionIgnore]
  })

  registerGotItemEvent(itemGetter, recommendationSetter, (itemId: string) => {
    itemsInPageInteractionMap[itemId] = [...(itemsInPageInteractionMap[itemId] || []), ItemsInteractionForcedDone]
  })

  registerStarEvent(itemGetter, (itemId: string) => {
    itemsInPageInteractionMap[itemId] = [...(itemsInPageInteractionMap[itemId] || []), ItemsInteractionStar]
  })

  registerNextItemEvent(nextItemGetter, itemGetter, setGetter, {
    isNeedRecommendationGetter: () => isNeedRecommendation,
    identityGetter: () => identity,
  })

  registerPrevItemEvent(
    () => {
      if (currentItemPointer <= 0) {
        return null
      }

      return getItemAtPointer(--currentItemPointer, -1)
    },
    itemGetter,
    setGetter
  )

  registerHoverBubblePopoverEvent()

  registerMorePopoverEvent()

  registerSelectEvent()

  registerNextSetEvent(async () => {
    await sendClearCachedRandomSetMessage()
    await initValues()
  })

  registerSuggestionSearchButtonClickEvent()
  registerSuggestionLoginButtonClickEvent(processInjection)
  registerPronounceButtonClickEvent()
  registerTopBarCardButtonsClickEvent()
  registerHoverCardEvent()

  const suggestionInteractCallback = () => {
    setTimeout(async () => {
      if (!allInjectionTargets) return
      isNeedRecommendation = false

      await sendClearCachedRandomSetMessage()
      await initValues()

      processInjection().finally(() => {
        const intervalId = detectPageChanged(processInjection, hrefComparer.bind({ allInjectionTargets }), allIntervalIds)
        allIntervalIds.push(intervalId)
      })
    }, 5000)
  }
  registerSubscribeEvent(suggestionInteractCallback)
  registerLikeEvent(suggestionInteractCallback)
  registerDislikeEvent(suggestionInteractCallback)
}

/**
 * Get item at pointer, skip hidden items.
 * @param pointerPosition position to point to the set items.
 * @param skipStep Step to skip when a hidden item is met.
 * @returns item
 */
const getItemAtPointer = (pointerPosition: number, skipStep: number = 1): any => {
  // Out of bound.
  if (pointerPosition >= randomItemIndexVisitMap.length) return null

  let rawItem = setInfo?.items && setInfo?.items[randomItemIndexVisitMap[pointerPosition]]

  if (!rawItem) return null

  if (isItemHidden(rawItem._id)) {
    return getItemAtPointer(pointerPosition + skipStep, skipStep)
  }

  return rawItem
    ? {
        ...rawItem,
        setId: setInfo?._id || "",
        setTitle: setInfo?.name || "",
        isStared: itemsInPageInteractionMap[rawItem._id]?.includes("star") ? "stared" : "",
        fromLanguage: setInfo?.fromLanguage,
        toLanguage: setInfo?.toLanguage,
      }
    : null
}

const isItemHidden = (itemId: string): boolean => {
  const itemInteractions = itemsInPageInteractionMap[itemId] || []

  return itemInteractions.includes(ItemsInteractionForcedDone) || itemInteractions.includes(ItemsInteractionIgnore)
}
