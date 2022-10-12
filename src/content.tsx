import "./background/templates/css/antd-wrapped.less"

import PageInjector from "./background/PageInjector"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import {
  ContentPageStatistics,
  InjectionTargetsResponse,
  KeyValuePair,
  SetInfo,
  SetInfoItem,
  User,
} from "./common/types/types"
import { detectPageChanged, hrefComparer } from "./common/utils/domUtils"
import {
  sendClearCachedRandomSetMessage,
  sendCountInteractedItemsMessage,
  sendGetInjectionTargetsMessage,
  sendGetRandomSubscribedSetSilentMessage,
  sendGetRestrictedKeywordsMessage,
  sendGetSetSilentMessage,
  sendGetStarredItemsMessage,
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
  registerHoverBubbleCloseEvent,
  registerPronounceButtonClickEvent,
  registerTopBarCardButtonsClickEvent,
  registerHoverCardEvent,
  registerSubscribeEvent,
  registerLikeEvent,
  registerDislikeEvent,
  registerReviewStarredItemsEvent,
} from "./pages/content-script/eventRegisters"
import { getHref, isSiteSupportedInjection } from "./pages/content-script/domHelpers"
import { generateNumbersArray, shuffleArray } from "./common/utils/arrayUtils"
import {
  generateTemplateExtraValues,
  getNetworkErrorTemplateValues,
  getNotLoggedInTemplateValues,
  getNotSubscribedTemplateValues,
  getRecommendationTemplateValues,
  getSuggestReviewTemplateValues,
  toTemplateValues,
} from "./pages/content-script/templateHelpers"
import {
  i18n,
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionShow,
  ItemsInteractionStar,
  ItemsLimitPerGet,
  SetTypeNormal,
  SetTypeReviewStarredItems,
  StarItemsLimitPerGet,
} from "./common/consts/constants"

import "@/background/templates/css/content.scss"

import { appearInPercent, getStorageSyncData } from "./common/utils/utils"
import CacheKeys from "./common/consts/cacheKeys"
import React from "react"
import { renderToString } from "react-dom/server"
import { htmlStringToHtmlNode } from "./background/DomManipulator"
import { FixedWidget } from "./background/templates/FixedWidget"
import { TrackingNameSuggestFromNoInteraction, TrackingNameSuggestToSubscribeRandomly } from "./common/consts/trackingNames"

let randomItemIndexVisitMap: number[] = []
let setInfo: SetInfo | null
let currentItemPointer = 0
let itemsInPageInteractionMap: {
  [itemId: string]: string[]
} = {}

let lastError: any = null

let isLoggedIn = false
let havingSubscribedSets = false
let isNeedRecommendation = false
let isNeedReviewStaredItems = false
let identity: User
let statistics: ContentPageStatistics = {}

let allInjectors: PageInjector[] = []
let allInjectionTargets: InjectionTargetsResponse
let allIntervalIds: NodeJS.Timer[] = []

// Entry point for injection.
;(async () => {
  try {
    const [{ value: user }, { value: restrictedKeywords }, { value: targets }]: any[] = await Promise.allSettled([
      sendIdentityUserMessage(),
      sendGetRestrictedKeywordsMessage(),
      sendGetInjectionTargetsMessage(),
    ])

    identity = user

    if (restrictedKeywords.every((keyword: string) => !getHref().includes(keyword))) {
      injectFixedWidgetBubble()
    }

    allInjectionTargets = targets
    if (!isSiteSupportedInjection(allInjectionTargets, getHref())) return

    processInjection().finally(() => {
      const intervalId = detectPageChanged(processInjection, hrefComparer.bind({ allInjectionTargets }), allIntervalIds)
      allIntervalIds.push(intervalId)
    })
  } catch (error) {
    console.error(error)
  }
})()

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

    await determineStatisticsValues()

    if (determineIsNeedReviewStaredItems()) {
      isLoggedIn = true
      havingSubscribedSets = true

      setInfo = await buildStarredItemsSetInfo()
    } else {
      setInfo = await sendGetRandomSubscribedSetSilentMessage(0, ItemsLimitPerGet)
    }

    if (setInfo) {
      randomItemIndexVisitMap = shuffleArray(Array.from(Array(setInfo.items?.length || 0).keys()))
      isLoggedIn = true
      havingSubscribedSets = true

      setInfo.itemsInteractions?.map((itemInteractions) => {
        const isStarred = (itemInteractions.interactionCount.star || 0) % 2 == 1
        if (!isStarred) {
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

async function determineStatisticsValues() {
  statistics.starredItemsCount =
    (await sendCountInteractedItemsMessage(
      ItemsInteractionStar,
      [ItemsInteractionIgnore, ItemsInteractionForcedDone].join(",")
    )) || 0
  statistics.showItemCount = (await getStorageSyncData<number>(CacheKeys.showItemCount)) || 0
  statistics.interactItemCount = (await getStorageSyncData<number>(CacheKeys.interactItemCount)) || 0
}

/**
 * If we need to review starred items, we don't show recommendation.
 * If the set got interacted more than 80 percent, then 30% of the time this set is displayed, will show a similar set to recommendation.
 * @returns true if the recommendation card should be displayed in the page.
 */
async function determineIsNeedRecommendation() {
  if (isNeedReviewStaredItems) {
    isNeedRecommendation = false
  }

  if (isNeedRecommendation) return

  try {
    const minimumShowedItemToStartRecommend = 100
    const { showItemCount, interactItemCount } = statistics

    if (
      (showItemCount || 0) > minimumShowedItemToStartRecommend &&
      (interactItemCount || 0) / (showItemCount || 0) < 0.02 &&
      appearInPercent(0.25)
    ) {
      console.debug("suggest after no interaction for a long time")
      sendTrackingMessage(TrackingNameSuggestFromNoInteraction)
      isNeedRecommendation = true

      return
    }

    // 2% of the cards will be recommendation.
    if (appearInPercent(0.02)) {
      sendTrackingMessage(TrackingNameSuggestToSubscribeRandomly)
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

function determineIsNeedReviewStaredItems() {
  if (isNeedReviewStaredItems) return

  const minimumStarredItemToStartReview = 10

  if ((statistics.starredItemsCount || 0) >= minimumStarredItemToStartReview && appearInPercent(0.2)) {
    isNeedReviewStaredItems = true
  }

  return isNeedReviewStaredItems
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
    const existingInjectorsHash = allInjectors.map((injector) => injector.getHash())
    console.debug("existingInjectorsHash: " + existingInjectorsHash)

    injectionTargets.forEach(async ({ rate, type, selector, newGeneratedElementSelector, siblingSelector, strict }) => {
      const injector = new PageInjector(rate, type, selector, newGeneratedElementSelector, siblingSelector, strict)

      if (!existingInjectorsHash.includes(injector.getHash())) {
        injectors.push(injector)
      }
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

  if (isNeedReviewStaredItems) {
    isNeedReviewStaredItems = false
    return getSuggestReviewTemplateValues(statistics.starredItemsCount || 0)
  }

  if (isNeedRecommendation) {
    isNeedRecommendation = false
    return getRecommendationTemplateValues(setInfo, identity)
  }

  const item = await getItemAtPointer(currentItemPointer)
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

const isDisplayedAllItemsInSet = () => currentItemPointer + 1 >= (setInfo?.totalItemsCount || 0)

function registerFlashcardEvents() {
  const nextItemGetter = async () => {
    const item = await getItemAtPointer(++currentItemPointer)
    if (isDisplayedAllItemsInSet()) {
      isNeedRecommendation = true
      return null
    }

    return item
  }

  const prevItemGetter = async () => {
    if (currentItemPointer <= 0) {
      return null
    }

    const skipStep = -1
    return getItemAtPointer(--currentItemPointer, skipStep, () => {
      currentItemPointer += skipStep
    })
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

  registerPrevItemEvent(prevItemGetter, itemGetter, setGetter)

  registerHoverBubblePopoverEvent()
  registerHoverBubbleCloseEvent()

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
        const intervalId = detectPageChanged(
          processInjection,
          hrefComparer.bind({ allInjectionTargets }),
          allIntervalIds
        )
        allIntervalIds.push(intervalId)
      })
    }, 5000)
  }
  registerSubscribeEvent(suggestionInteractCallback)
  registerLikeEvent(suggestionInteractCallback)
  registerDislikeEvent(suggestionInteractCallback)
  registerReviewStarredItemsEvent(itemGetter)
}

/**
 * Get item at pointer, skip hidden items.
 * @param pointerPosition position to point to the set items.
 * @param skipStep Step to skip when a hidden item is met.
 * @returns item
 */
const getItemAtPointer = async (
  pointerPosition: number,
  skipStep: number = 1,
  pointerChangeCallback: Function = (skipStep: number = 1) => {
    currentItemPointer += skipStep
  }
): Promise<SetInfoItem | null> => {
  if (!setInfo) return null

  const isOutOfBound = pointerPosition >= (setInfo.totalItemsCount || 0) || pointerPosition < 0
  if (isOutOfBound) return null

  if (pointerPosition >= (setInfo.items?.length || 0)) {
    await appendNextItemsToCurrentSet()
  }

  let rawItem = setInfo.items && setInfo?.items[randomItemIndexVisitMap[pointerPosition]]

  if (!rawItem) return null

  if (isItemHidden(rawItem._id)) {
    pointerChangeCallback(skipStep)
    return getItemAtPointer(pointerPosition + skipStep, skipStep)
  }

  return rawItem
    ? ({
        setId: setInfo?._id || "",
        setTitle: setInfo?.name || "",
        isStared: itemsInPageInteractionMap[rawItem._id]?.includes("star") ? "stared" : "",
        fromLanguage: setInfo?.fromLanguage,
        toLanguage: setInfo?.toLanguage,
        setType: setInfo?.setType,
        ...rawItem,
      } as SetInfoItem)
    : null
}

const appendNextItemsToCurrentSet = async () => {
  if (!setInfo) return

  let setWithNextItems: SetInfo | null = null
  switch (setInfo.setType) {
    case SetTypeNormal:
      setWithNextItems = await sendGetSetSilentMessage(setInfo._id, setInfo.items?.length || 0, ItemsLimitPerGet)
      break

    case SetTypeReviewStarredItems:
      setWithNextItems = await buildStarredItemsSetInfo(setInfo.items?.length || 0, StarItemsLimitPerGet)
      break

    default:
      break
  }

  const newRandomItemsIndexMap = shuffleArray(generateNumbersArray(ItemsLimitPerGet, setInfo.items?.length || 0))
  randomItemIndexVisitMap.push(...newRandomItemsIndexMap)
  setInfo.items.push(...(setWithNextItems?.items || []))
}

const isItemHidden = (itemId: string): boolean => {
  const itemInteractions = itemsInPageInteractionMap[itemId] || []

  return itemInteractions.includes(ItemsInteractionForcedDone) || itemInteractions.includes(ItemsInteractionIgnore)
}

function injectFixedWidgetBubble() {
  const node = htmlStringToHtmlNode(renderToString(<FixedWidget />))
  document.querySelector("body")?.prepend(node)
}

async function buildStarredItemsSetInfo(skip: number = 0, limit: number = StarItemsLimitPerGet): Promise<SetInfo> {
  let setInfo = {
    name: i18n("my_starred_items"),
    totalItemsCount: statistics.starredItemsCount,
    setType: SetTypeReviewStarredItems,
  } as SetInfo

  const items = await sendGetStarredItemsMessage(
    ItemsInteractionStar,
    [ItemsInteractionIgnore, ItemsInteractionForcedDone].join(","),
    skip,
    limit
  )
  items.forEach((item) => (item.isStared = "stared"))

  setInfo.items = items

  return setInfo
}
