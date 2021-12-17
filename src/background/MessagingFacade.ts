import { ChromeMessageTypeGetRandomItem, ChromeMessageTypeToken } from "@/common/consts/constants"

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
  return new Promise<{ type: string;[key: string]: any } | null>((resolve, reject) => {
    sendMessage(ChromeMessageTypeGetRandomItem, null, resolve, reject)
  })
}
