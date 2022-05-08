import * as React from "react"
import { renderToString } from "react-dom/server"

import PageInjector from "./background/PageInjector"
import InjectionTargetFactory from "./background/InjectionTargetFactory"
import { SetInfo } from "./common/types/types"
import { detectPageChanged } from "./common/utils/domUtils"
import {
  sendClearCachedRandomSetMessage,
  sendGetRandomSubscribedSetMessage,
} from "./pages/content-script/messageSenders"
import {
  registerFlipCardEvent,
  registerMorePopoverEvent,
  registerNextItemEvent,
  registerNextSetEvent,
  registerPrevItemEvent,
  registerIgnoreEvent
} from "./pages/content-script/eventRegisters"
import { FlashCardTemplate } from "./background/templates/Flashcard"
import { getHref } from "./pages/content-script/domHelpers"
import { shuffleArray } from "./common/utils/arrayUtils"
import { toTemplateValues } from "./pages/content-script/templateHelpers"

let randomItemIndexVisitMap: number[] = []
let setInfo: SetInfo | null
let currentItemPointer = 0

detectPageChanged(async () => {
  try {
    // Remove cache from background page (app's scope).
    await sendClearCachedRandomSetMessage()

    await initValues()
    removeOldCards()
    await injectCards()
  } catch (error) {
    console.error(error)
    console.error("error when injecting set item")
  }
}, true)

registerFlashcardEvents()

async function initValues() {
  try {
    setInfo = await sendGetRandomSubscribedSetMessage()
    if (setInfo) {
      randomItemIndexVisitMap = shuffleArray(Array.from(Array(setInfo.items?.length || 0).keys()))
      currentItemPointer = 0
    }
  } catch (error) {
    console.error(error)
  }
}

function removeOldCards() {
  document.querySelectorAll(".lazy-vaccine").forEach((el) => el.remove())
}

async function injectCards() {
  try {
    const injectionTargets = new InjectionTargetFactory(getHref()).getTargets()

    injectionTargets.forEach(async ({ type, selector, siblingSelector }) => {
      const injector = new PageInjector(1, type, selector, siblingSelector)

      injector.waitInject(renderToString(<FlashCardTemplate />), randomTemplateValues)
    })
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
  }
}

const randomTemplateValues = async () => {
  const item = getItemAtPointer(currentItemPointer++)
  return item ? toTemplateValues(item, { setId: setInfo?._id || "", setTitle: setInfo?.name || "" }) : []
}

function registerFlashcardEvents() {
  const nextItemGetter = async () => {
    const isDisplayedAllItemsInSet = currentItemPointer + 1 === setInfo?.items?.length
    if (isDisplayedAllItemsInSet) {
      await sendClearCachedRandomSetMessage()
      await initValues()
      return getItemAtPointer(currentItemPointer++)
    }

    return getItemAtPointer(++currentItemPointer)
  }

  const itemGetter = async () => {
    await sendClearCachedRandomSetMessage()
    await initValues()

    return getItemAtPointer(currentItemPointer++)
  }

  registerFlipCardEvent()

  registerIgnoreEvent(itemGetter, nextItemGetter)

  registerNextItemEvent(nextItemGetter)

  registerPrevItemEvent(() => {
    if (currentItemPointer === 0) {
      return null
    }

    return getItemAtPointer(--currentItemPointer)
  })

  registerMorePopoverEvent()

  registerNextSetEvent(async () => {
    await sendClearCachedRandomSetMessage()
    await initValues()

    return getItemAtPointer(currentItemPointer++)
  })
}

const getItemAtPointer = (pointerPosition: number) => {
  const rawItem = setInfo?.items && setInfo?.items[randomItemIndexVisitMap[pointerPosition]]

  return rawItem
    ? {
        ...rawItem,
        setId: setInfo?._id || "",
        setTitle: setInfo?.name || "",
      }
    : null
}
