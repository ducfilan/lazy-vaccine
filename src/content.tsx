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
} from "./pages/content-script/eventRegisters"
import { getHref } from "./pages/content-script/domHelpers"
import { shuffleArray } from "./common/utils/arrayUtils"
import { generateItemValue, toTemplateValues } from "./pages/content-script/templateHelpers"
import { ItemsInteractionShow } from "./common/consts/constants"

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
      injector.waitInject(randomTemplateValues)
    })
  } catch (error) {
    console.log(`unexpected error: ${JSON.stringify(error)}`)
  }
}

const randomTemplateValues = async () => {
  const item = getItemAtPointer(currentItemPointer++)
  sendInteractItemMessage(setInfo?._id || "", item?._id || "", ItemsInteractionShow)
    .then(() => {})
    .catch((error) => {
      // TODO: handle error case.
      console.error(error)
    })

  return item ? toTemplateValues(item, generateItemValue(item)) : []
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

  const itemGetter = () => {
    return getItemAtPointer(currentItemPointer)
  }

  registerFlipCardEvent()

  registerSelectAnswerEvent()

  registerCheckAnswerEvent()

  registerIgnoreEvent(itemGetter)

  registerGotItemEvent(itemGetter)

  registerStarEvent(itemGetter)

  registerNextItemEvent(nextItemGetter, itemGetter)

  registerPrevItemEvent(() => {
    if (currentItemPointer === 0) {
      return null
    }

    return getItemAtPointer(--currentItemPointer)
  }, itemGetter)

  registerMorePopoverEvent()

  registerNextSetEvent(async () => {
    await sendClearCachedRandomSetMessage()
    await initValues()
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
