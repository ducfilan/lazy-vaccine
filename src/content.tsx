import "./background/templates/css/antd-wrapped.less"

import PageInjector from "./background/PageInjector"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { SetInfo } from "./common/types/types"
import { detectPageChanged } from "./common/utils/domUtils"
import {
  sendClearCachedRandomSetMessage,
  sendGetRandomSubscribedSetMessage,
  sendInteractItemMessage,
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
} from "./pages/content-script/eventRegisters"
import { getHref } from "./pages/content-script/domHelpers"
import { shuffleArray } from "./common/utils/arrayUtils"
import { generateTemplateExtraValues, toTemplateValues } from "./pages/content-script/templateHelpers"
import {
  ItemsInteractionForcedDone,
  ItemsInteractionIgnore,
  ItemsInteractionShow,
  ItemsInteractionStar,
  OtherItemTypes,
} from "./common/consts/constants"

import "@/background/templates/css/_common.scss"
import "@/background/templates/css/content.scss"
import "@/background/templates/css/flashcard.scss"
import "@/background/templates/css/QandA.scss"
import "@/background/templates/css/suggest-subscribe.scss"

import { hrefToSiteName } from "./background/DomManipulator"
import { getInjectionTargets } from "./common/repo/injection-targets"

function hrefComparer(this: any, oldHref: string, newHref: string) {
  for (const target of this?.targets || []) {
    const oldId = oldHref.match(target.MatchPattern)?.groups?.id
    const newId = newHref.match(target.MatchPattern)?.groups?.id

    console.log(`Debug: oldHref: ${oldHref}, newHref: ${newHref}, oldId: ${oldId}, newId: ${newId}`)

    if (!oldId && !newId) {
      continue
    }

    return oldId === newId
  }

  return oldHref === newHref
}

const getNotLoggedInTemplateValues = async () => {
  return [
    { key: "type", value: OtherItemTypes.NotLoggedIn.value },
    { key: "website", value: await hrefToSiteName(getHref()) },
  ]
}

const getNotSubscribedTemplateValues = async () => {
  return [
    { key: "type", value: OtherItemTypes.NotSubscribed.value },
    { key: "website", value: await hrefToSiteName(getHref()) },
  ]
}

let randomItemIndexVisitMap: number[] = []
let setInfo: SetInfo | null
let currentItemPointer = 0
let itemsInPageInteractionMap: {
  [itemId: string]: string[]
} = {}

let isLoggedIn = false
let havingSubscribedSets = false

let allInjectors: PageInjector[] | undefined = []

getInjectionTargets()
  .then((targets) => {
    detectPageChanged(processInjection, true, hrefComparer.bind({ targets }))
  })
  .catch((err) => {
    console.error(err)
  })

async function processInjection() {
  console.debug("processInjection called")

  try {
    // Remove cache from background page (app's scope).
    await sendClearCachedRandomSetMessage()

    await initValues()

    removeOldCards()

    disconnectExistingObservers()
    allInjectors = await injectCards()
  } catch (error) {
    console.error(error)
    console.error("error when injecting set item")
  }
}

function disconnectExistingObservers() {
  if (!allInjectors) return

  allInjectors.forEach((injector) => {
    console.debug("getAllObservers: " + injector.getAllObservers().length)
    injector.getAllObservers().forEach((observer) => observer.stop())
  })
}

registerFlashcardEvents()

async function initValues() {
  try {
    currentItemPointer = 0
    havingSubscribedSets = false

    setInfo = await sendGetRandomSubscribedSetMessage()
    if (setInfo) {
      randomItemIndexVisitMap = shuffleArray(Array.from(Array(setInfo.items?.length || 0).keys()))
      isLoggedIn = true
      havingSubscribedSets = true

      setInfo.itemsInteractions?.map((itemInteractions) => {
        itemsInPageInteractionMap[itemInteractions.itemId] = Object.keys(itemInteractions.interactionCount)
      })
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
      console.error(error)
    }
  }
}

function removeOldCards() {
  document.querySelectorAll(".lazy-vaccine").forEach((el) => el.remove())
}

async function injectCards(): Promise<PageInjector[]> {
  try {
    const injectionTargets = await new InjectionTargetFactory(getHref()).getTargets()
    console.debug("injectCards called, injectionTargets: " + injectionTargets.length)

    let injectors: PageInjector[] = []

    injectionTargets.forEach(async ({ rate, type, selector, newGeneratedElementSelector, siblingSelector, strict }) => {
      const injector = new PageInjector(rate, type, selector, newGeneratedElementSelector, siblingSelector, strict)
      injector.waitInject(randomTemplateValues)

      injectors.push(injector)
    })

    return injectors
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
    return []
  }
}

const randomTemplateValues = async (increaseOnCall: boolean = false) => {
  console.log(
    "Debug: randomTemplateValues called, isLoggedIn: " +
      isLoggedIn +
      ", havingSubscribedSets: " +
      havingSubscribedSets +
      ", items count: " +
      setInfo?.items?.length
  )

  if (!isLoggedIn) {
    return getNotLoggedInTemplateValues()
  }

  if (!havingSubscribedSets) {
    return getNotSubscribedTemplateValues()
  }

  const item = getItemAtPointer(currentItemPointer)
  if (increaseOnCall) {
    currentItemPointer++

    // TODO: Possible infinity loop check.
    if (isDisplayedAllItemsInSet()) {
      await sendClearCachedRandomSetMessage()
      await initValues()
    }
  }

  item &&
    sendInteractItemMessage(setInfo?._id || "", item?._id || "", ItemsInteractionShow)
      .then(() => {
        itemsInPageInteractionMap[item?._id] = [...(itemsInPageInteractionMap[item?._id] || []), ItemsInteractionShow]
      })
      .catch((error) => {
        // TODO: handle error case.
        console.error(error)
      })

  return item ? toTemplateValues(item, generateTemplateExtraValues(item)) : []
}

const isDisplayedAllItemsInSet = () => currentItemPointer + 1 === setInfo?.items?.length

function registerFlashcardEvents() {
  const nextItemGetter = async () => {
    if (isDisplayedAllItemsInSet()) {
      await sendClearCachedRandomSetMessage()
      await initValues()
      return getItemAtPointer(currentItemPointer++)
    }

    return getItemAtPointer(++currentItemPointer)
  }

  const itemGetter = () => {
    return getItemAtPointer(currentItemPointer)
  }

  const setGetter = () => {
    return setInfo
  }

  registerFlipCardEvent()

  registerSelectAnswerEvent()

  registerCheckAnswerEvent()

  registerIgnoreEvent(itemGetter, (itemId: string) => {
    itemsInPageInteractionMap[itemId] = [...(itemsInPageInteractionMap[itemId] || []), ItemsInteractionIgnore]
    filterItemList(itemId)
  })

  registerGotItemEvent(itemGetter, (itemId: string) => {
    itemsInPageInteractionMap[itemId] = [...(itemsInPageInteractionMap[itemId] || []), ItemsInteractionForcedDone]
    filterItemList(itemId)
  })

  const filterItemList = (itemId: string) => {
    setInfo = setInfo && {
      ...setInfo,
      items: setInfo?.items?.filter((item) => item._id !== itemId),
    }
  }

  registerStarEvent(itemGetter, (itemId: string) => {
    itemsInPageInteractionMap[itemId] = [...(itemsInPageInteractionMap[itemId] || []), ItemsInteractionStar]
  })

  registerNextItemEvent(nextItemGetter, itemGetter, setGetter)

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

  registerMorePopoverEvent()

  registerSelectEvent()

  registerNextSetEvent(async () => {
    await sendClearCachedRandomSetMessage()
    await initValues()
  })

  registerSuggestionSearchButtonClickEvent()
  registerSuggestionLoginButtonClickEvent(processInjection)
}

/**
 * Get item at pointer, skip hidden items.
 * @param pointerPosition position to point to the set items.
 * @param skipStep Step to skip when a hidden item is met.
 * @returns item
 */
const getItemAtPointer = (pointerPosition: number, skipStep: number = 1): any => {
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
      }
    : null
}

const isItemHidden = (itemId: string): boolean => {
  const itemInteractions = itemsInPageInteractionMap[itemId] || []

  return itemInteractions.includes(ItemsInteractionForcedDone) || itemInteractions.includes(ItemsInteractionIgnore)
}
