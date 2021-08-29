import { AxiosResponse } from "axios"

import Apis from "@consts/apis"
import GoogleApiUrls from "@consts/googleApiUrls"
import { LoginTypes } from "@consts/constants"
import CacheKeys from "@consts/cacheKeys"
import { GoogleUserInfo, User } from "@/common/types/types"
import registerSteps from "@consts/registerSteps"
import { Http } from "./axiosFacade"

export function getGoogleAuthToken(callback: Function, options?: any) {
  chrome.identity.getAuthToken(options, async serviceAccessToken => {
    if (chrome.runtime.lastError && !options?.interactive) {
      throw new Error("It was not possible to get a token programmatically.")
    } else if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError.message)
    } else if (serviceAccessToken) {
      callback(serviceAccessToken)
    } else {
      throw new Error("The OAuth Token was null")
    }
  })
}

let _getAuthOptions = (isSignedOut: boolean) => isSignedOut ? ({ interactive: true }) : ({})

export function signIn(this: any, type: string, callback: Function) {
  const http = <Http>this.http

  switch (type) {
    case LoginTypes.google:
      chrome.storage.sync.get([CacheKeys.isSignedOut], isSignedOut => {
        const options = _getAuthOptions(!!isSignedOut)

        getGoogleAuthToken(async (serviceAccessToken: string) => {
          try {
            const { data: userInfo } = await http.get<any, AxiosResponse<GoogleUserInfo>>(
              `${GoogleApiUrls.getUserInfo}${serviceAccessToken}`
            )

            const { data: registeredUser } = await http.post<any, AxiosResponse<User>>(
              `${process.env.API_BASE_URL}${Apis.users}`,
              { type, serviceAccessToken, finishedRegisterStep: registerSteps.Register, ...userInfo }
            )

            chrome.storage.sync.set({ [CacheKeys.isSignedOut]: false })
            callback(registeredUser)
          } catch (e) {
            // TODO: Try again.
            signOut.call({ http })
            this.setIsShowLoginError(true)
          }
        }, options)
      })
      break

    default:
      break
  }
}

export function signOut(this: any, callback?: () => void) {
  try {
    const http = <Http>this.http

    getGoogleAuthToken((serviceAccessToken: string) => {
      http.get(`${GoogleApiUrls.revokeToken}${serviceAccessToken}`)
      chrome.identity.removeCachedAuthToken({ token: serviceAccessToken }, callback)
    }, ({}))

    chrome.storage.sync.set({ [CacheKeys.isSignedOut]: true })
  } catch (error) {
    // TODO: Notice user.
  }
}

// TODO: Handle onSignInChanged https://developer.chrome.com/docs/extensions/reference/identity/#event-onSignInChanged