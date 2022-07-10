import { AxiosResponse } from "axios"

import Apis from "@consts/apis"
import GoogleApiUrls from "@consts/googleApiUrls"
import registerSteps from "@consts/registerSteps"
import { NotLoggedInError } from "@consts/errors"
import { LoginTypes, MaxTryAgainSignInCount } from "@consts/constants"
import CacheKeys from "@consts/cacheKeys"
import { GoogleUserInfo, User } from "@/common/types/types"
import { get, Http } from "./axiosFacade"

export function getGoogleAuthToken(options: any = {}, tryAgainCount: number = 0) {
  return new Promise<any>((resolve, reject) => {
    chrome.identity.getAuthToken(options, async serviceAccessToken => {
      const lastError = chrome.runtime.lastError
      if (lastError) {
        if (lastError.message?.includes("not granted or revoked") || lastError.message?.includes("not approve access")) {
          reject(new NotLoggedInError(lastError.message))
        } else if (tryAgainCount >= MaxTryAgainSignInCount) {
          reject(lastError.message)
        } else {
          return getGoogleAuthToken({ interactive: true }, tryAgainCount + 1)
        }
      } else if (serviceAccessToken) {
        resolve(serviceAccessToken)
      } else {
        reject("The OAuth Token was null")
      }
    })
  })
}

let _getAuthOptions = (isSignedOut: boolean) => isSignedOut ? ({ interactive: true }) : ({})

export function signIn(this: any, type: string, callback: Function) {
  const http = <Http>this.http

  switch (type) {
    case LoginTypes.google:
      chrome.storage.sync.get([CacheKeys.isSignedOut], isSignedOut => {
        const options = _getAuthOptions(!!isSignedOut)

        getGoogleAuthToken(options)
          .then(async (serviceAccessToken: string) => {
            const { data: userInfo } = await get<any, AxiosResponse<GoogleUserInfo>>(
              `${GoogleApiUrls.getUserInfo}${serviceAccessToken}`
            )

            const { data: registeredUser } = await http.post<any, AxiosResponse<User>>(
              `${process.env.API_BASE_URL}${Apis.users}`,
              { type, serviceAccessToken, finishedRegisterStep: registerSteps.Register, ...userInfo }
            )

            chrome.storage.sync.set({ [CacheKeys.isSignedOut]: false })
            callback(registeredUser)
          })
          .catch(() => {
            signOut.call({ http })
            this.setIsShowLoginError(true)
          })
      })
      break

    default:
      break
  }
}

export function signOut(callback?: () => void) {
  try {
    getGoogleAuthToken()
      .then((serviceAccessToken: string) => {
        fetch(`${GoogleApiUrls.revokeToken}${serviceAccessToken}`).then(callback)
        chrome.identity.removeCachedAuthToken({ token: serviceAccessToken }, callback)
      })

    chrome.storage.sync.set({ [CacheKeys.isSignedOut]: true })
  } catch (error) {
    // TODO: Notice user.
    console.error(error)
  }
}

// TODO: Handle onSignInChanged https://developer.chrome.com/docs/extensions/reference/identity/#event-onSignInChanged