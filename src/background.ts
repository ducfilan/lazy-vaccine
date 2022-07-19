import CacheKeys from "./common/consts/cacheKeys"
import { ChromeMessageClearRandomSetCache, ChromeMessageTypeGetLocalSetting, ChromeMessageTypeGetRandomSet, ChromeMessageTypeInteractItem, ChromeMessageTypeSetLocalSetting, ChromeMessageTypeToken, InteractionSubscribe, LocalStorageKeyPrefix, LoginTypes } from "./common/consts/constants"
import { NotLoggedInError, NotSubscribedError } from "./common/consts/errors"
import { getGoogleAuthToken } from "./common/facades/authFacade"
import { Http } from "./common/facades/axiosFacade"
import { interactToSetItem } from "./common/repo/set"
import { getUserInteractionRandomSet } from "./common/repo/user"
import { SetInfo } from "./common/types/types"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case ChromeMessageTypeToken:
      getGoogleAuthToken(request.arg || {}).then((token: string) => {
        sendResponse({ success: true, result: token })
      }).catch(error => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeGetRandomSet:
      getGoogleAuthToken().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        getRandomSubscribedSet(http).then((set) => {
          sendResponse({ success: true, result: set })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch((error: Error) => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageClearRandomSetCache:
      clearCachedRandomSet()
      sendResponse({ success: true })
      break

    case ChromeMessageTypeInteractItem:
      getGoogleAuthToken().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        interactItem(http, request.arg.setId, request.arg.itemId, request.arg.action).then(() => {
          sendResponse({ success: true })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch(error => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      sendResponse({ success: true })
      break

    case ChromeMessageTypeSetLocalSetting:
      setLocalSetting(request.arg.settingKey, request.arg.settingValue)
      sendResponse({ success: true })
      break

    case ChromeMessageTypeGetLocalSetting:
      const setting = getLocalSetting(request.arg.settingKey)
      sendResponse({ success: true, result: setting })
      break

    default:
      break
  }

  return true
})

async function getRandomSubscribedSet(http: Http): Promise<SetInfo | null> {
  // TODO: Handle situation when set has edited, item ids got changed.
  let randomSetInfo = getCachedSet()

  if (!randomSetInfo) {
    randomSetInfo = await getUserInteractionRandomSet(http, InteractionSubscribe)
    setCachedSet(randomSetInfo)
  }

  return randomSetInfo
}

async function interactItem(http: Http, setId: string, itemId: string, action: string): Promise<any> {
  return interactToSetItem(http, setId, itemId, action)
}

function getCachedSet(): SetInfo {
  const cachedRandomSetInfo = localStorage.getItem(LocalStorageKeyPrefix + CacheKeys.randomSet)
  return cachedRandomSetInfo ? JSON.parse(cachedRandomSetInfo) : null
}

function setCachedSet(set: SetInfo) {
  localStorage.setItem(LocalStorageKeyPrefix + CacheKeys.randomSet, JSON.stringify(set))
}

function clearCachedRandomSet() {
  localStorage.setItem(LocalStorageKeyPrefix + CacheKeys.randomSet, "")
}

// Local settings.
function getLocalSetting(settingKey: string) {
  return localStorage.getItem(`${LocalStorageKeyPrefix}${CacheKeys.localSetting}.${settingKey}`)
}

function setLocalSetting(settingKey: string, settingValue: string) {
  return localStorage.setItem(`${LocalStorageKeyPrefix}${CacheKeys.localSetting}.${settingKey}`, settingValue)
}

function toResponseError(error: Error) {
  let type = "Error"

  if (error instanceof NotLoggedInError) {
    type = "NotLoggedInError"
  } else if (error instanceof NotSubscribedError) {
    type = "NotSubscribedError"
  }

  return { success: false, error: { type: type, message: error.message } }
}