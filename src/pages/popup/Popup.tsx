import React from "react"
import { BrowserRouter as Router } from "react-router-dom"

const { useState, useEffect } = React

import "./css/popup.scss"

import Navbar from "@/common/components/Navbar"
import Loading from "@/common/components/Loading"
import FirstTime from "./components/FirstTime"
import ChooseLanguages from "./components/ChooseLanguages"
import CompletedInfo from "./components/CompletedInfo"

import RegisterSteps from "@consts/registerSteps"

import { getMyInfo } from "@/common/repo/user"
import { User } from "@/common/types/types"
import { getGoogleAuthTokenSilent } from "@facades/authFacade"
import { Http } from "@facades/axiosFacade"
import { i18n, LoginTypes } from "@/common/consts/constants"
import { GlobalContext } from "@/common/contexts/GlobalContext"
import NetworkError from "@/common/components/NetworkError"

const PopupPage = () => {
  const [user, setUser] = useState<User | null>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http | null>()
  const [lastError, setLastError] = useState<any>(null)
  const [contentElement, setContentElement] = useState<any>(
    <div>
      <Loading />
    </div>
  )

  useEffect(() => {
    setIsLoading(true)

    getGoogleAuthTokenSilent()
      .then((token: string) => {
        setHttp(new Http(token, LoginTypes.google))
      })
      .catch((error: any) => {
        setHttp(null)
        setIsLoading(false)
        setLastError(error)
      })
  }, [])

  useEffect(() => {
    if (!http) return

    getMyInfo(http)
      .then((userInfo) => {
        setUser(userInfo)
      })
      .catch((error) => {
        setLastError(error)
        setUser(null)
        // Not able to login with current token or the user is not registered, ignore to show the first page to login.
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [http])

  useEffect(() => {
    popupHeightScrollIssueWorkaround()

    handleNetworkError()

    if (isLoading)
      setContentElement(
        <div>
          <Loading />
        </div>
      )

    handleExternalPopupToLogin()
      .catch(() => {})
      .finally(() => {
        const finishedRegisterStep = user?.finishedRegisterStep

        switch (finishedRegisterStep) {
          case RegisterSteps.ChooseLanguages:
            setContentElement(<CompletedInfo />)
            break

          case RegisterSteps.Install:
            setContentElement(<FirstTime />)
            break

          case RegisterSteps.Register:
            setContentElement(
              <div tabIndex={0}>
                <ChooseLanguages />
              </div>
            )
            break

          default:
            setContentElement(<FirstTime />)
            break
        }
      })
  }, [http, user])

  function handleNetworkError() {
    if (!lastError) return

    switch (lastError.code) {
      case "ECONNABORTED":
        if (lastError.message.startsWith("timeout of")) {
          setContentElement(
            <div>
              <NetworkError errorText={i18n("network_error_timeout")} />
            </div>
          )
        }
        break

      case "ERR_NETWORK":
        setContentElement(
          <div>
            <NetworkError errorText={i18n("network_error_offline")} />
          </div>
        )
        break

      default:
        break
    }
  }

  function handleExternalPopupToLogin() {
    return new Promise<void>((resolve, reject) => {
      const isExternalPopupWindow = new URLSearchParams(window.location.search).get("external")

      const needToShowExternalPopup = (http === null || user === null) && !isExternalPopupWindow

      if (needToShowExternalPopup) {
        console.debug("showing login popup window")
        let intervalId = setInterval(() => {
          if (document.querySelector(".first-time-intro--login-button") !== null) {
            clearInterval(intervalId)

            chrome.windows.onFocusChanged.addListener(() => {
              chrome.windows.getLastFocused({ windowTypes: ["popup"] }, (window) => {
                window?.id && user && chrome.windows.remove(window.id)
              })
            })

            chrome.windows.create(
              {
                type: "popup",
                url: `${chrome.runtime.getURL("pages/popup.html")}?external=true`,
                width: 783,
                height: 600,
                focused: true,
                left: window.screenLeft,
                top: window.screenTop,
              },
              () => {
                window.close()
                resolve()
              }
            )
          }
        }, 200)
      } else {
        reject()
      }
    })
  }

  /**
   * Popup has an issue of not showing scroll when the size of the popup is greater than 600px,
   * this is an ugly workaround so far: Set the min-height to 601 (in css), then set it back to 600.
   */
  function popupHeightScrollIssueWorkaround() {
    document.body.style.minHeight = "601px"
    document.body.style.overflow = "overlay"
    setTimeout(() => {
      document.body.style.minHeight = "600px"
      document.body.style.overflow = "auto"
    }, 100)
  }

  return (
    <GlobalContext.Provider value={{ user, setUser, http, setHttp }}>
      <Router>
        <div className="App">
          {!isLoading && <Navbar target="_blank" />}
          {contentElement}
        </div>
      </Router>
    </GlobalContext.Provider>
  )
}

export default PopupPage
