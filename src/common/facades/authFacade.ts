import { AxiosResponse } from "axios"
import { v4 as uuid } from "uuid"

import GoogleApiUrls from "@consts/googleApiUrls"
import registerSteps from "@consts/registerSteps"
import CacheKeys from "@/common/consts/caching"
import { NotLoggedInError } from "@consts/errors"
import { GoogleClientId, i18n, LoginTypes, MaxTryAgainSignInCount } from "@consts/constants"
import { ApiGetTokenFromCode, ApiRefreshAccessToken, ApiUsers } from "@consts/apis"
import { GoogleUserInfo, User } from "@/common/types/types"
import { get, Http } from "./axiosFacade"
import { logout } from "@/common/repo/user"
import { openPopupCenter } from "@/common/utils/domUtils"

export function getGoogleAuthToken(options: any = {}, tryAgainCount: number = 0) {
  return new Promise<any>((resolve, reject) => {
    chrome.storage.sync.get(CacheKeys.accessToken, obj => {
      const accessToken = obj[CacheKeys.accessToken]
      if (accessToken && !options.interactive) resolve(accessToken)
      else {
        launchAndGetToken(options, tryAgainCount).then(resolve).catch(reject)
      }
    })
  })
}

export function getGoogleAuthTokenSilent() {
  return new Promise<any>((resolve, reject) => {
    chrome.storage.sync.get(CacheKeys.accessToken, obj => {
      const accessToken = obj[CacheKeys.accessToken]
      if (accessToken) resolve(accessToken)
      else {
        reject(new NotLoggedInError("No access token found"))
      }
    })
  })
}

export function refreshAccessToken() {
  return new Promise<string>((resolve, reject) => {
    chrome.storage.sync.get(CacheKeys.refreshToken, obj => {
      const refreshToken = obj[CacheKeys.refreshToken]
      if (refreshToken) {
        get<any, AxiosResponse<{ access_token: string }>>(
          `${ApiRefreshAccessToken(refreshToken)}`
        )
          .then((resp) => {
            const access_token = resp?.data?.access_token

            if (access_token) {
              chrome.storage.sync.set({ [CacheKeys.accessToken]: access_token })
              resolve(access_token)
            } else {
              launchAndGetToken().then(resolve).catch(reject)
            }
          })
          .catch(error => {
            reject(error)
          })
      } else {
        launchAndGetToken().then(resolve).catch(reject)
      }
    })
  })
}

function launchAndGetToken(options: any = {}, tryAgainCount: number = 0) {
  return new Promise<any>((resolve, reject) => {
    const initialState = `${process.env.EXTENSION_TARGET_BROWSER}_${uuid()}`

    const url = new URLSearchParams(Object.entries({
      client_id: GoogleClientId,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: "code",
      scope: "profile email openid",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state: initialState
    }))

    openPopupCenter({
      url: "https://accounts.google.com/o/oauth2/v2/auth?" + url.toString(),
      h: 500,
      w: 500, title: i18n("login_google"),
      onPopupClosed: () => !window.acceptedGoogleLogin && reject(new NotLoggedInError("not approve access"))
    })

    window.receiveToken = ({ state, code }: any) => {
      if (state && initialState !== state) {
        reject("Wrong response state")
      }

      const lastError = chrome.runtime.lastError
      if (lastError) {
        if (lastError.message?.includes("not granted or revoked") || lastError.message?.includes("not approve access")) {
          reject(new NotLoggedInError(lastError.message))
        } else if (tryAgainCount >= MaxTryAgainSignInCount) {
          reject(lastError.message)
        } else {
          launchAndGetToken({ interactive: true }, tryAgainCount + 1).then(resolve).catch(reject)
        }
      } else if (code) {
        get<any, AxiosResponse<{ access_token: string, refresh_token: string }>>(
          `${ApiGetTokenFromCode(code)}`
        ).then((resp) => {
          const { access_token, refresh_token } = resp?.data || {}

          if (!access_token || !refresh_token) reject("no access token or refresh token")

          chrome.storage.sync.set({ [CacheKeys.accessToken]: access_token })
          chrome.storage.sync.set({ [CacheKeys.refreshToken]: refresh_token })

          resolve(access_token)
        }).catch(reject)
      } else {
        reject("The OAuth Token was null")
      }
    }
  })
}

let _getAuthOptions = (isSignedOut: boolean) => isSignedOut ? ({ interactive: true }) : ({})

export function signIn(this: any, type: string) {
  const setHttp = this && this.setHttp ? <(http: Http | null) => void>this.setHttp : null

  return new Promise<User | null>((resolve, reject) => {
    switch (type) {
      case LoginTypes.google:
        chrome.storage.sync.get([CacheKeys.isSignedOut], obj => {
          const options = _getAuthOptions(obj ? obj[CacheKeys.isSignedOut] : false)

          getGoogleAuthToken(options)
            .then(async (token: string) => {
              const { data: userInfo } = await get<any, AxiosResponse<GoogleUserInfo>>(
                `${GoogleApiUrls.getUserInfo}${token}`
              )

              userInfo.locale = userInfo.locale.substring(0, 2)

              const http = new Http(token, LoginTypes.google)
              setHttp && setHttp(http)

              const { data: registeredUser } = await http.post<any, AxiosResponse<User>>(
                ApiUsers,
                { type, serviceAccessToken: token, finishedRegisterStep: registerSteps.Register, ...userInfo }
              )

              chrome.storage.sync.set({ [CacheKeys.isSignedOut]: false })
              resolve(registeredUser)
            })
            .catch((error) => {
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

export function signOut(http: Http, callback: () => void = () => { }) {
  getGoogleAuthTokenSilent()
    .then((token: string) => {
      logout(http)
        .then(() => {
          clearLoginInfoCache()
          clearLocalCache()
          window.heap.resetIdentity()
          revokeToken(token)
        })
        .catch((error) => console.log(error))
        .finally(callback)
    })
    .catch((error) => {
      // TODO: Notice user.
      console.error(error)
      callback()
    })
}

export function clearLoginInfoCache() {
  chrome.storage.sync.remove([CacheKeys.accessToken, CacheKeys.refreshToken])
  chrome.storage.sync.set({ [CacheKeys.isSignedOut]: true })
}

function clearLocalCache() {
  localStorage.clear()
}

export function revokeToken(token: string) {
  fetch(`${GoogleApiUrls.revokeToken}${token}`).catch((error) => { console.error(error) }).finally(() => {
    chrome.identity.removeCachedAuthToken({ token: token })
  })
}

// TODO: Handle onSignInChanged https://developer.chrome.com/docs/extensions/reference/identity/#event-onSignInChanged