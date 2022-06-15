import { sendMessage } from "@/background/MessagingFacade"
import { ChromeMessageClearRandomSetCache, ChromeMessageTypeGetLocalSetting, ChromeMessageTypeGetRandomItem, ChromeMessageTypeGetRandomSet, ChromeMessageTypeInteractItem, ChromeMessageTypeSetLocalSetting } from "@/common/consts/constants"
import { SetInfo, SetInfoItem } from "@/common/types/types"

export function sendClearCachedRandomSetMessage() {
  return new Promise<string>((resolve, reject) => {
    sendMessage(ChromeMessageClearRandomSetCache, null, resolve, reject)
  })
}

export function sendGetRandomSubscribedItemMessage() {
  return new Promise<SetInfoItem | null>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetRandomItem, null, resolve, reject)
  })
}

export function sendGetRandomSubscribedSetMessage() {
  return new Promise<SetInfo | null>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetRandomSet, null, resolve, reject)
  })
}

export function sendInteractItemMessage(setId: string, itemId: string, action: string) {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeInteractItem, { setId, itemId, action }, resolve, reject)
  })
}

export function sendSetLocalSettingMessage(settingKey: string, settingValue: string) {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeSetLocalSetting, { settingKey, settingValue }, resolve, reject)
  })
}

export function sendGetLocalSettingMessage(settingKey: string) {
  return new Promise<{ settingValue: string | null }>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetLocalSetting, { settingKey }, resolve, reject)
  })
}
