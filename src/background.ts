import { ChromeMessageTypeGetRandomItem, ChromeMessageTypeToken, LoginTypes } from "./common/consts/constants";
import { getGoogleAuthToken } from "./common/facades/authFacade";
import { Http } from "./common/facades/axiosFacade";
import { getSetInfo } from "./common/repo/set";
import { randomIntFromInterval } from "./common/utils/numberUtils";

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

    default:
      break
  }

  return true
})

export async function getRandomSubscribedItem(http: Http): Promise<{ type: string;[key: string]: any } | null> {
  // TODO: Dummy, need to update.
  const setInfo = await getSetInfo(http, "619e6cef8cfa8400a94f8e1d")

  if (!setInfo || !setInfo.items || setInfo.items.length === 0) return null
  const randomPosition = randomIntFromInterval(0, setInfo.items.length - 1)
  const item = setInfo.items[randomPosition]

  return item
}
