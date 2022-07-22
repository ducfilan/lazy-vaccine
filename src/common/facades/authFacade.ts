import { AxiosResponse } from "axios"

import Apis from "@consts/apis"
import GoogleApiUrls from "@consts/googleApiUrls"
import registerSteps from "@consts/registerSteps"
import { NotLoggedInError } from "@consts/errors"
import { GoogleClientId, LoginTypes, MaxTryAgainSignInCount } from "@consts/constants"
import CacheKeys from "@consts/cacheKeys"
import { GoogleUserInfo, User } from "@/common/types/types"
import { get, Http } from "./axiosFacade"

export function getGoogleAuthToken(options: any = {}, tryAgainCount: number = 0) {
  return new Promise<any>((resolve, reject) => {
    const url = new URLSearchParams(Object.entries({
      client_id: GoogleClientId,
      redirect_uri: chrome.identity.getRedirectURL(),
      response_type: "token",
      scope: "profile email openid",
      login_hint: "your_name@gmail.com",
    }))

    chrome.identity.launchWebAuthFlow({ url: "https://accounts.google.com/o/oauth2/auth?" + url.toString(), ...options }, function (redirectURL) {
      const token = redirectURL?.match("#access_token=(.*?)&")?.at(1)

      const lastError = chrome.runtime.lastError
      if (lastError) {
        if (lastError.message?.includes("not granted or revoked") || lastError.message?.includes("not approve access")) {
          reject(new NotLoggedInError(lastError.message))
        } else if (tryAgainCount >= MaxTryAgainSignInCount) {
          reject(lastError.message)
        } else {
          getGoogleAuthToken({ interactive: true }, tryAgainCount + 1)
        }
      } else if (token) {
        resolve(token)
      } else {
        reject("The OAuth Token was null")
      }
    })
  })
}

let _getAuthOptions = (isSignedOut: boolean) => isSignedOut ? ({ interactive: true }) : ({})

export function signIn(this: any, type: string) {
  const setHttp = <(http: Http | null) => void>this.setHttp

  return new Promise<User | null>((resolve, reject) => {
    switch (type) {
      case LoginTypes.google:
        chrome.storage.sync.get([CacheKeys.isSignedOut], isSignedOut => {
          const options = _getAuthOptions(isSignedOut ? isSignedOut[CacheKeys.isSignedOut] : false)

          getGoogleAuthToken(options)
            .then(async (token: string) => {
              const { data: userInfo } = await get<any, AxiosResponse<GoogleUserInfo>>(
                `${GoogleApiUrls.getUserInfo}${token}`
              )

              const http = new Http(token, LoginTypes.google)
              setHttp(http)

              const { data: registeredUser } = await http.post<any, AxiosResponse<User>>(
                `${process.env.API_BASE_URL}${Apis.users}`,
                { type, serviceAccessToken: token, finishedRegisterStep: registerSteps.Register, ...userInfo }
              )

              chrome.storage.sync.set({ [CacheKeys.isSignedOut]: false })
              resolve(registeredUser)
            })
            .catch((error) => {
              signOut()

              reject(error)
            })
        })
        break

      default:
        resolve(null)
        break
    }
  })
}

export function signOut(callback: () => void = () => { }) {
  getGoogleAuthToken()
    .then((token: string) => {
      fetch(`${GoogleApiUrls.revokeToken}${token}`).then(callback).catch((error) => { console.error(error) })
      chrome.identity.removeCachedAuthToken({ token: token }, callback)
    })
    .catch((error) => {
      // TODO: Notice user.
      console.error(error)
    })

  chrome.storage.sync.set({ [CacheKeys.isSignedOut]: true })
}

// TODO: Handle onSignInChanged https://developer.chrome.com/docs/extensions/reference/identity/#event-onSignInChanged