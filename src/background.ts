import { ApiPronounceText } from "@consts/apis"
import CacheKeys from "@consts/cacheKeys"
import { ChromeMessageClearRandomSetCache, ChromeMessageTypeGetLocalSetting, ChromeMessageTypeGetRandomSetSilent, ChromeMessageTypeIdentifyUser, ChromeMessageTypeInteractItem, ChromeMessageTypePlayAudio, ChromeMessageTypeSuggestSets, ChromeMessageTypeSetLocalSetting, ChromeMessageTypeSignUp, ChromeMessageTypeToken, ChromeMessageTypeTracking, HeapIoId, InteractionSubscribe, ItemsInteractionShow, LocalStorageKeyPrefix, LoginTypes, ChromeMessageTypeInteractSet, ChromeMessageTypeUndoInteractSet, ChromeMessageTypeCountInteractedItems, ChromeMessageTypeGetInteractedItems, SetTypeNormal, ChromeMessageTypeGetSetSilent } from "@consts/constants"
import { NotLoggedInError, NotSubscribedError } from "@consts/errors"
import { getGoogleAuthToken, getGoogleAuthTokenSilent, signIn } from "./common/facades/authFacade"
import { Http } from "./common/facades/axiosFacade"
import { getSetInfo, interactToSet, interactToSetItem, undoInteractToSet } from "./common/repo/set"
import { countInteractedItems, getInteractedItems, getMyInfo, getUserInteractionRandomSet, suggestSets } from "./common/repo/user"
import { SetInfo, User } from "./common/types/types"
import { getStorageSyncData } from "./common/utils/utils"

let lastAudio: HTMLAudioElement

includeHeapAnalytics()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case ChromeMessageTypeToken:
      getGoogleAuthToken(request.arg || {}).then((token: string) => {
        sendResponse({ success: true, result: token })
      }).catch(error => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeIdentifyUser:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        getMyInfo(http).then((user: User) => {
          window.heap.identify(user?.email)
          window.heap.addUserProperties({ name: user?.name || "", finished_register_step: user?.finishedRegisterStep })
          sendResponse({ success: true, user })
        }).catch(() => {
          sendResponse({ success: false })
        })
      }).catch(() => {
        sendResponse({ success: false })
      })
      break

    case ChromeMessageTypeSignUp:
      window.heap.track("Signup from injected card")
      signIn
        .call(null, LoginTypes.google)
        .then((user: User | null) => {
          window.heap.identify(user?.email)
          window.heap.addUserProperties({ name: user?.name || "", finished_register_step: user?.finishedRegisterStep })
          sendResponse({ success: true, result: user })
        })
        .catch((error) => {
          sendResponse({ success: false, error: toResponseError(error) })
        })

      break

    case ChromeMessageTypeTracking:
      if (!request.arg.name) return

      if (!request.arg.metadata) {
        window.heap.track(request.arg.name)
      } else {
        window.heap.track(request.arg.name, request.arg.metadata)
      }

      break

    case ChromeMessageTypeGetRandomSetSilent:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        const { itemsSkip, itemsLimit } = request.arg

        getRandomSubscribedSet(http, itemsSkip, itemsLimit).then((set) => {
          set && (set.setType = SetTypeNormal)
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
      getGoogleAuthTokenSilent().then((token: string) => {
        window.heap.track(request.arg.action === ItemsInteractionShow ? "Show item" : "Interact item", { interaction: request.arg.action, itemId: request.arg.itemId })
        increaseSyncStorageCount(request.arg.action === ItemsInteractionShow ? CacheKeys.showItemCount : CacheKeys.interactItemCount)

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

    case ChromeMessageTypeInteractSet:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)

        interactToSet(http, request.arg.setId, request.arg.action).then(() => {
          sendResponse({ success: true })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch(error => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeUndoInteractSet:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)

        undoInteractToSet(http, request.arg.setId, request.arg.action).then(() => {
          sendResponse({ success: true })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch(error => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeSetLocalSetting:
      setLocalSetting(request.arg.settingKey, request.arg.settingValue)
      sendResponse({ success: true })
      break

    case ChromeMessageTypeGetLocalSetting:
      const setting = getLocalSetting(request.arg.settingKey)
      sendResponse({ success: true, result: setting })
      break

    case ChromeMessageTypePlayAudio:
      window.heap.track("Play audio", { langCode: request.arg.langCode, text: request.arg.text })
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        http
          .get(ApiPronounceText(request.arg.text, request.arg.langCode), {
            responseType: "arraybuffer",
            headers: {
              "Content-Type": "audio/mpeg",
            },
          })
          .then((result) => {
            const blob = new Blob([result.data], {
              type: "audio/mpeg",
            })

            lastAudio && lastAudio.pause()
            lastAudio = new Audio(URL.createObjectURL(blob))
            lastAudio.play()
          })
          .catch((error) => {
            console.debug(error)
          })
        sendResponse({ success: true })
      }).catch((error: Error) => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeSuggestSets:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        suggestSets(http, request.arg.keyword, request.arg.languages, request.arg.skip, request.arg.limit).then((res) => {
          sendResponse({ success: true, result: res })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch((error: Error) => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeCountInteractedItems:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        countInteractedItems(http, request.arg.interactionInclude, request.arg.interactionIgnore).then((result) => {
          sendResponse({ success: true, result })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch((error: Error) => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeGetInteractedItems:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        const { interactionInclude, interactionIgnore, skip, limit } = request.arg

        getInteractedItems(http, interactionInclude, interactionIgnore, skip, limit).then((result) => {
          sendResponse({ success: true, result })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch((error: Error) => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeGetSetSilent:
      getGoogleAuthTokenSilent().then((token: string) => {
        const http = new Http(token, LoginTypes.google)
        const { setId, itemsSkip, itemsLimit } = request.arg

        getSetInfo(http, setId, itemsSkip, itemsLimit).then((set) => {
          sendResponse({ success: true, result: set })
        }).catch(error => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      }).catch((error: Error) => {
        sendResponse({ success: false, error: toResponseError(error) })
      })

    default:
      break
  }

  return true
})

async function getRandomSubscribedSet(http: Http, itemsSkip: number, itemsLimit: number): Promise<SetInfo | null> {
  // TODO: Handle situation when set has edited, item ids got changed.
  let randomSetInfo = getCachedSet()

  if (!randomSetInfo) {
    randomSetInfo = await getUserInteractionRandomSet(http, InteractionSubscribe, itemsSkip, itemsLimit)
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

function toResponseError(error: any) {
  let type = "Error"

  if (error instanceof NotLoggedInError) {
    type = "NotLoggedInError"
  } else if (error instanceof NotSubscribedError) {
    type = "NotSubscribedError"
  }

  return { success: false, error: { type: type, message: error.message, code: error.code } }
}

function includeHeapAnalytics() {
  window.heap = window.heap || [], window.heap.load = function (e: any, t: any) { window.heap.appid = e, window.heap.config = t = t || {}; let r = document.createElement("script"); r.type = "text/javascript", r.async = !0, r.src = "https://cdn.heapanalytics.com/js/heap-" + e + ".js"; let a = document.getElementsByTagName("script")[0]; a.parentNode!.insertBefore(r, a); for (let n = function (e: any) { return function () { window.heap.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }, p = ["addEventProperties", "addUserProperties", "clearEventProperties", "identify", "resetIdentity", "removeEventProperty", "setEventProperties", "track", "unsetEventProperty"], o = 0; o < p.length; o++)window.heap[p[o]] = n(p[o]) }
  window.heap.load(HeapIoId)
}

function increaseSyncStorageCount(cacheKey: string) {
  getStorageSyncData<number>(cacheKey).then(currentValue => {
    chrome.storage.sync.set({ [CacheKeys.showItemCount]: (currentValue || 0) + 1 })
  })
}
