import "regenerator-runtime/runtime.js"
import { ApiPronounceText } from "@consts/apis"
import CacheKeys from "@/common/consts/caching"
import {
  ChromeMessageClearRandomSetCache,
  ChromeMessageTypeGetLocalSetting,
  ChromeMessageTypeGetRandomSetSilent,
  ChromeMessageTypeIdentifyUser,
  ChromeMessageTypeInteractItem,
  ChromeMessageTypePlayAudio,
  ChromeMessageTypeSuggestSets,
  ChromeMessageTypeSetLocalSetting,
  ChromeMessageTypeToken,
  InteractionSubscribe,
  ItemsInteractionShow,
  LocalStorageKeyPrefix,
  LoginTypes,
  ChromeMessageTypeInteractSet,
  ChromeMessageTypeUndoInteractSet,
  ChromeMessageTypeCountInteractedItems,
  ChromeMessageTypeGetInteractedItems,
  SetTypeNormal,
  ChromeMessageTypeGetSetSilent,
  ChromeMessageTypeGetInjectionTargets,
  ChromeMessageTypeGetRestrictedKeywords
} from "@consts/constants"
import { NotLoggedInError, NotSubscribedError } from "@consts/errors"
import { getGoogleAuthToken, getGoogleAuthTokenSilent } from "@/common/facades/authFacade"
import { Http } from "@/common/facades/axiosFacade"
import { getSetInfo, interactToSet, interactToSetItem, undoInteractToSet } from "@/common/repo/set"
import { clearServerCache, countInteractedItems, getInteractedItems, getMyInfo, getUserInteractionRandomSet, suggestSets } from "@/common/repo/user"
import { SetInfo, User } from "./common/types/types"
import { getStorageLocalData, getStorageSyncData, setStorageLocalData } from "@/common/utils/utils"
import { getInjectionTargets, getRestrictedKeywords } from "./common/repo/staticApis"

let lastAudio: HTMLAudioElement

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
          sendResponse({ success: true, result: user })
        }).catch((e) => {
          console.error(e)
          sendResponse({ success: false })
        })
      }).catch((e) => {
        console.error(e)
        sendResponse({ success: false })
      })
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
      clearLocalCachedRandomSet().then(() => {
        getGoogleAuthTokenSilent().then((token: string) => {
          const http = new Http(token, LoginTypes.google)
          const { cacheType } = request.arg

          clearServerRandomSetCache(http, cacheType)
            .then(() => sendResponse({ success: true }))
            .catch(error => {
              sendResponse({ success: false, error: toResponseError(error) })
            })
        }).catch((error: Error) => {
          sendResponse({ success: false, error: toResponseError(error) })
        })
      })

      break

    case ChromeMessageTypeInteractItem:
      getGoogleAuthTokenSilent().then((token: string) => {
        const { action: interaction, itemId, href } = request.arg

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
      setLocalSetting(request.arg.settingKey, request.arg.settingValue).then(() => {
        sendResponse({ success: true })
      }).catch(() => {
        sendResponse({ success: false })
      })
      break

    case ChromeMessageTypeGetLocalSetting:
      getLocalSetting<string>(request.arg.settingKey).then(setting => {
        sendResponse({ success: true, result: setting })
      }).catch(() => {
        sendResponse({ success: false })
      })
      break

    case ChromeMessageTypePlayAudio:
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
      break

    case ChromeMessageTypeGetInjectionTargets:
      getInjectionTargets().then((injectTargets) => {
        sendResponse({ success: true, result: injectTargets })
      }).catch(error => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    case ChromeMessageTypeGetRestrictedKeywords:
      getRestrictedKeywords().then((restrictedKeywords) => {
        sendResponse({ success: true, result: restrictedKeywords })
      }).catch(error => {
        sendResponse({ success: false, error: toResponseError(error) })
      })
      break

    default:
      break
  }

  return true
})

async function getRandomSubscribedSet(http: Http, itemsSkip: number, itemsLimit: number): Promise<SetInfo | null> {
  // TODO: Handle situation when set has edited, item ids got changed.
  let randomSetInfo = await getCachedSet()

  if (!randomSetInfo) {
    randomSetInfo = await getUserInteractionRandomSet(http, [InteractionSubscribe], itemsSkip, itemsLimit)
    await setCachedSet(randomSetInfo)
  }

  return randomSetInfo
}

async function interactItem(http: Http, setId: string, itemId: string, action: string): Promise<any> {
  return interactToSetItem(http, setId, itemId, action)
}

async function getCachedSet(): Promise<SetInfo> {
  const cachedRandomSetInfo = await getLocalSetting<string>(LocalStorageKeyPrefix + CacheKeys.randomSet)
  return cachedRandomSetInfo ? JSON.parse(cachedRandomSetInfo) : null
}

function setCachedSet(set: SetInfo) {
  return setLocalSetting(LocalStorageKeyPrefix + CacheKeys.randomSet, JSON.stringify(set))
}

function clearLocalCachedRandomSet() {
  return setLocalSetting(LocalStorageKeyPrefix + CacheKeys.randomSet, "")
}

async function clearServerRandomSetCache(http: Http, cacheType: string) {
  await clearServerCache(http, cacheType)
}

// Local settings.
function getLocalSetting<T>(settingKey: string): Promise<T> {
  return getStorageLocalData<T>(`${LocalStorageKeyPrefix}${CacheKeys.localSetting}.${settingKey}`)
}

function setLocalSetting(settingKey: string, settingValue: string) {
  return setStorageLocalData(`${LocalStorageKeyPrefix}${CacheKeys.localSetting}.${settingKey}`, settingValue)
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

function increaseSyncStorageCount(cacheKey: string) {
  getStorageSyncData<number>(cacheKey).then(currentValue => {
    chrome.storage.sync.set({ [CacheKeys.showItemCount]: (currentValue || 0) + 1 })
  })
}
