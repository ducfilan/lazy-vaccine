import CacheKeys from "./common/consts/cacheKeys"
import { ChromeMessageClearRandomSetCache, ChromeMessageTypeGetRandomItem, ChromeMessageTypeToken, InteractionSubscribe, LocalStorageKeyPrefix, LoginTypes } from "./common/consts/constants"
import { getGoogleAuthToken } from "./common/facades/authFacade"
import { Http } from "./common/facades/axiosFacade"
import { getUserInteractionRandomSet } from "./common/repo/user"
import { SetInfo, SetInfoItem } from "./common/types/types"
import { randomIntFromInterval } from "./common/utils/numberUtils"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case ChromeMessageTypeToken:
      getGoogleAuthToken().then((token: string) => {
        sendResponse({ success: true, result: token })
      }).catch(error => {
        sendResponse({ success: false, error })
      })
      break

    case ChromeMessageTypeGetRandomItem:
      getGoogleAuthToken().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        getRandomSubscribedItem(http).then((item: { type: string;[key: string]: any } | null) => {
          sendResponse({ success: true, result: item })
        }).catch(error => {
          sendResponse({ success: false, error })
        })
      }).catch(error => {
        sendResponse({ success: false, error })
      })
      break

    case ChromeMessageClearRandomSetCache:
      clearCachedRandomSet()
      sendResponse({ success: true })
      break

    default:
      break
  }

  return true
})

export async function getRandomSubscribedItem(http: Http): Promise<SetInfoItem | null> {
  let randomSetInfo = getCachedSet()

  if (!randomSetInfo) {
    randomSetInfo = await getUserInteractionRandomSet(http, InteractionSubscribe)
    setCachedSet(randomSetInfo)
  }

  if (!randomSetInfo || !randomSetInfo.items || randomSetInfo.items.length === 0) return null
  const randomPosition = randomIntFromInterval(0, randomSetInfo.items.length - 1)
  const item = randomSetInfo.items[randomPosition]

  return { ...item, setId: randomSetInfo._id, setTitle: randomSetInfo.name }
}

function getCachedSet(): SetInfo {
  console.log("cache hit")
  const cachedRandomSetInfo = localStorage.getItem(LocalStorageKeyPrefix + CacheKeys.randomSet)
  return cachedRandomSetInfo ? JSON.parse(cachedRandomSetInfo) : null
}

function setCachedSet(set: SetInfo) {
  const cachedRandomSetInfo = localStorage.setItem(LocalStorageKeyPrefix + CacheKeys.randomSet, JSON.stringify(set))
}

function clearCachedRandomSet() {
  localStorage.setItem(LocalStorageKeyPrefix + CacheKeys.randomSet, "")
}
