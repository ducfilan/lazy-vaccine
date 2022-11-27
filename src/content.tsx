import "./background/templates/css/antd-wrapped.less"

import PageInjector from "./background/PageInjector"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { InjectionTargetsResponse } from "./common/types/types"
import { detectPageChanged, hrefComparer } from "./common/utils/domUtils"
import {
  sendClearCachedRandomSetMessage,
  sendGetInjectionTargetsMessage,
  sendGetRestrictedKeywordsMessage,
  sendIdentityUserMessage as sendIdentifyUserMessage,
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
import { HeapIoId, ItemsInteractionForcedDone, ItemsInteractionIgnore, ItemsInteractionStar } from "./common/consts/constants"

import "@/background/templates/css/content.scss"

import React from "react"
import { renderToString } from "react-dom/server"
import { htmlStringToHtmlNode } from "./background/DomManipulator"
import { FixedWidget } from "./background/templates/FixedWidget"
import { ContentData } from "./background/ContentData"

let contentData = new ContentData()

let allInjectors: PageInjector[] = []
let allInjectionTargets: InjectionTargetsResponse
let allIntervalIds: NodeJS.Timer[] = []

// Entry point for injection.
;(async () => {
  try {
    includeHeapAnalytics()

    const [{ value: user }, { value: restrictedKeywords }, { value: targets }]: any[] = await Promise.allSettled([
      sendIdentifyUserMessage(),
      sendGetRestrictedKeywordsMessage(),
      sendGetInjectionTargetsMessage(),
    ])

    contentData.setIdentity(user)
    window.heap.identify(user?.email)
    window.heap.addUserProperties({ name: user?.name || "", finished_register_step: user?.finishedRegisterStep })

    if (restrictedKeywords?.every((keyword: string) => !getHref().includes(keyword))) {
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
    await contentData.initValues()

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

    await Promise.all(
      injectors.map((i) =>
        i.waitInject(async () => {
          const templateValues = await contentData.randomTemplateValues()

          if (!templateValues || templateValues.length == 0) {
            console.debug("no template values, showing recommendation")
            contentData.isNeedRecommendation = true
            processInjection()
          }

          return templateValues
        })
      )
    )
    console.debug("all injection done!")

    return injectors
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
    return []
  }
}

function registerFlashcardEvents() {
  const nextItemGetter = async () => {
    const item = await contentData.getItemAtPointer(++contentData.currentItemPointer)
    if (contentData.isDisplayedAllItemsInSet) {
      contentData.isNeedRecommendation = true
      return null
    }

    return item
  }

  const prevItemGetter = async () => {
    if (contentData.currentItemPointer <= 0) {
      return null
    }

    const skipStep = -1
    return contentData.getItemAtPointer(--contentData.currentItemPointer, skipStep, () => {
      contentData.currentItemPointer += skipStep
    })
  }

  const itemGetter = () => {
    return contentData.getItemAtPointer(contentData.currentItemPointer)
  }

  const setGetter = () => {
    return contentData.setInfo
  }

  const recommendationSetter = (value: boolean) => (contentData.isNeedRecommendation = value)

  registerFlipCardEvent()

  registerSelectAnswerEvent()

  registerCheckAnswerEvent()

  registerIgnoreEvent(itemGetter, recommendationSetter, (itemId: string) => {
    contentData.interactItem(itemId, ItemsInteractionIgnore)
  })

  registerGotItemEvent(itemGetter, recommendationSetter, (itemId: string) => {
    contentData.interactItem(itemId, ItemsInteractionForcedDone)
  })

  registerStarEvent(itemGetter, (itemId: string) => {
    contentData.interactItem(itemId, ItemsInteractionStar)
  })

  registerNextItemEvent(nextItemGetter, itemGetter, setGetter, {
    isNeedRecommendationGetter: () => contentData.isNeedRecommendation,
    identityGetter: contentData.getIdentity,
  })

  registerPrevItemEvent(prevItemGetter, itemGetter, setGetter)

  registerHoverBubblePopoverEvent()
  registerHoverBubbleCloseEvent()

  registerMorePopoverEvent()

  registerSelectEvent()

  registerNextSetEvent(async () => {
    await sendClearCachedRandomSetMessage()
    await contentData.initValues()
  })

  registerSuggestionSearchButtonClickEvent()
  registerSuggestionLoginButtonClickEvent(processInjection)
  registerPronounceButtonClickEvent()
  registerTopBarCardButtonsClickEvent()
  registerHoverCardEvent()

  const suggestionInteractCallback = () => {
    setTimeout(async () => {
      if (!allInjectionTargets) return
      contentData.isNeedRecommendation = false

      await contentData.initValues()

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

function injectFixedWidgetBubble() {
  const node = htmlStringToHtmlNode(renderToString(<FixedWidget />))
  document.querySelector("body")?.prepend(node)
}

function includeHeapAnalytics() {
  window.heap = window.heap || [], window.heap.load = function (e: any, t: any) { window.heap.appid = e, window.heap.config = t = t || {}; for (let n = function (e: any) { return function () { window.heap.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }, p = ["addEventProperties", "addUserProperties", "clearEventProperties", "identify", "resetIdentity", "removeEventProperty", "setEventProperties", "track", "unsetEventProperty"], o = 0; o < p.length; o++)window.heap[p[o]] = n(p[o]) }
  window.heap.load(HeapIoId)
}
