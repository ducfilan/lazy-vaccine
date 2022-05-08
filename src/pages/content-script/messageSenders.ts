import { sendMessage } from "@/background/MessagingFacade"
import { ChromeMessageClearRandomSetCache, ChromeMessageTypeGetRandomItem, ChromeMessageTypeGetRandomSet, ChromeMessageTypeInteractItem } from "@/common/consts/constants"
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

export function sendItemInteractionsMessage(setId: string, itemId: string, action: string) {
  return new Promise<{success: boolean}>((resolve, reject) => {
    sendMessage(ChromeMessageTypeInteractItem, {setId, itemId, action}, resolve, reject)
  })
}
