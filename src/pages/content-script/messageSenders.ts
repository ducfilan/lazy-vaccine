import { sendMessage } from "@/background/MessagingFacade"
import { CacheTypeUserRandomSet } from "@/common/consts/caching"
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
  ChromeMessageTypeInteractSet,
  ChromeMessageTypeUndoInteractSet,
  ChromeMessageTypeCountInteractedItems,
  ChromeMessageTypeGetInteractedItems,
  ChromeMessageTypeGetSetSilent,
  ChromeMessageTypeGetInjectionTargets,
  ChromeMessageTypeGetRestrictedKeywords,
  StarItemsLimitPerGet
} from "@/common/consts/constants"
import { TrackingNameInteractItem } from "@/common/consts/trackingNames"
import { SetInfo, SetInfoItem } from "@/common/types/types"
import { trackUserItemInteraction } from "@/common/utils/utils"
import { track } from "@amplitude/analytics-browser"

export function sendClearCachedRandomSetMessage() {
  return new Promise<string>((resolve, reject) => {
    sendMessage(ChromeMessageClearRandomSetCache, { cacheType: CacheTypeUserRandomSet }, resolve, reject)
  })
}

/**
 * Get the subscribed set randomly without showing login popup when no token is cached.
 */
export function sendGetRandomSubscribedSetSilentMessage(itemsSkip: number, itemsLimit: number) {
  return new Promise<SetInfo | null>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetRandomSetSilent, { itemsSkip, itemsLimit }, resolve, reject)
  })
}

export function sendGetSetSilentMessage(setId: string, itemsSkip: number, itemsLimit: number) {
  return new Promise<SetInfo | null>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetSetSilent, { setId, itemsSkip, itemsLimit }, resolve, reject)
  })
}

export function sendInteractItemMessage(setId: string, itemId: string, action: string) {
  trackUserItemInteraction(action, itemId)
  return new Promise<{ success: boolean }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeInteractItem, { setId, itemId, action, href: window?.location?.href || "unknown" }, resolve, reject)
  })
}

export function sendInteractSetMessage(setId: string, action: string) {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeInteractSet, { setId, action }, resolve, reject)
  })
}

export function sendUndoInteractSetMessage(setId: string, action: string) {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeUndoInteractSet, { setId, action }, resolve, reject)
  })
}

export function sendSetLocalSettingMessage(settingKey: string, settingValue: string) {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeSetLocalSetting, { settingKey, settingValue }, resolve, reject)
  })
}

export function sendGetLocalSettingMessage(settingKey: string) {
  return new Promise<string>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetLocalSetting, { settingKey }, resolve, reject)
  })
}

export function sendGetGoogleTokenMessage() {
  return new Promise<{ token: string }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeToken, { interactive: true }, resolve, reject)
  })
}

export function sendPronounceMessage(text: string, langCode: string) {
  track(TrackingNameInteractItem, { interaction: "Play audio", langCode, text })

  return new Promise<any>((resolve, reject) => {
    sendMessage(ChromeMessageTypePlayAudio, { text, langCode }, resolve, reject)
  })
}

export function sendIdentifyUserMessage() {
  return new Promise<any>((resolve, reject) => {
    sendMessage(ChromeMessageTypeIdentifyUser, null, resolve, reject)
  })
}

export function sendGetRecommendationsMessage(keyword: string, languages: string[], skip: number, limit: number) {
  return new Promise<any>((resolve, reject) => {
    sendMessage(ChromeMessageTypeSuggestSets, { keyword, languages, skip, limit }, resolve, reject)
  })
}

export function sendCountInteractedItemsMessage(interactionInclude: string, interactionIgnore: string) {
  return new Promise<number>((resolve, reject) => {
    sendMessage(ChromeMessageTypeCountInteractedItems, { interactionInclude, interactionIgnore }, resolve, reject)
  })
}

export function sendGetStarredItemsMessage(interactionInclude: string, interactionIgnore: string, skip: number = 0, limit: number = StarItemsLimitPerGet) {
  return new Promise<SetInfoItem[]>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetInteractedItems, { interactionInclude, interactionIgnore, skip, limit }, resolve, reject)
  })
}

export function sendGetInjectionTargetsMessage() {
  return new Promise<SetInfoItem[]>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetInjectionTargets, null, resolve, reject)
  })
}

export function sendGetRestrictedKeywordsMessage() {
  return new Promise<SetInfoItem[]>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetRestrictedKeywords, null, resolve, reject)
  })
}
