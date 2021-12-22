import { ChromeMessageTypeGetRandomItem, ChromeMessageTypeToken } from "@/common/consts/constants"
import { SetInfoItem } from "@/common/types/types"

function sendMessage(type: string, arg: any, resolve: Function, reject: Function) {
  chrome.runtime.sendMessage({ type, arg }, async function ({ success, result, error }) {
    if (!success) {
      reject(`cannot get response, type: ${type}, error: ${JSON.stringify(error)}`)
    }

    resolve(result)
  })
}

export async function requestGoogleToken() {
  return new Promise<string>((resolve, reject) => {
    sendMessage(ChromeMessageTypeToken, null, resolve, reject)
  })
}

export async function getRandomSubscribedItem() {
  return new Promise<SetInfoItem | null>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetRandomItem, null, resolve, reject)
  })
}
