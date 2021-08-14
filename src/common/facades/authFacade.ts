import { Cookies } from "react-cookie"
import { AxiosResponse } from "axios"

import { http } from "@facades/axiosFacade"
import Apis from "@consts/apis"
import GoogleApiUrls from "@consts/googleApiUrls"
import Constants from "@consts/constants"
import CacheKeys from "@consts/cacheKeys"
import { GoogleUserInfo, User } from "@/common/types/types"
import registerSteps from "@consts/registerSteps"

const cookies = new Cookies()

let _processGoogleAuthToken = (callback: Function, options?: any) => {
  options = options || {
    interactive: true
  }

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

export function signIn(this: any, type: string, callback: Function) {
  switch (type) {
    case Constants.loginTypes.google:
      _processGoogleAuthToken(async (serviceAccessToken: string) => {
        try {
          const { data: userInfo } = await http.get<any, AxiosResponse<GoogleUserInfo>>(
            `${GoogleApiUrls.getUserInfo}${serviceAccessToken}`
          )

          const { data: registeredUser } = await http.post<any, AxiosResponse<User>>(
            `${process.env.API_BASE_URL}${Apis.users}`,
            { type, serviceAccessToken, finishedRegisterStep: registerSteps.Register, ...userInfo }
          )

          cookies.set(CacheKeys.jwtToken, registeredUser.jwtToken)

          callback(registeredUser)
        } catch (e) {
          signOut()
          this.setIsShowLoginError(true)
        }
      })
      break

    default:
      break
  }
}

export function signOut(callback?: () => void) {
  let serviceAccessToken = cookies.get(CacheKeys.jwtToken)

  http.get(`${GoogleApiUrls.revokeToken}${serviceAccessToken}`)
  chrome.identity.removeCachedAuthToken({ token: serviceAccessToken }, callback)
}
