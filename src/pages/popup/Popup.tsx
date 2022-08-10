import React from "react"
import { BrowserRouter as Router } from "react-router-dom"

const { useState, useEffect } = React

import "./css/popup.scss"

import Navbar from "@/common/components/Navbar"
import Loading from "@/common/components/Loading"
import FirstTime from "./components/FirstTime"
import ChooseLanguages from "./components/ChooseLanguages"
import ChoosePages from "./components/ChoosePages"
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http | null>(null)
  const [lastError, setLastError] = useState<any>(null)

  useEffect(() => {
    try {
      setIsLoading(true)

      getGoogleAuthTokenSilent()
        .then((token: string) => {
          setHttp(new Http(token, LoginTypes.google))
        })
        .catch((error: any) => {
          setIsLoading(false)
          console.error(error)
          setLastError(error)
        })
    } catch (error) {
      // Not able to login with current token, ignore to show the first page to login.
    }
  }, [])

  useEffect(() => {
    if (!http) return

    getMyInfo(http)
      .then((userInfo) => {
        setUser(userInfo)
      })
      .catch((error) => {
        setLastError(error)
        // Not able to login with current token or the user is not registered, ignore to show the first page to login.
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [http])

  function renderPages() {
    popupHeightScrollIssueWorkaround()

    if (lastError) {
      switch (lastError.code) {
        case "ECONNABORTED":
          if (lastError.message.startsWith("timeout of")) {
            return (
              <div>
                <NetworkError errorText={i18n("network_error_timeout")} />
              </div>
            )
          }
          break

        case "ERR_NETWORK":
          return (
            <div>
              <NetworkError errorText={i18n("network_error_offline")} />
            </div>
          )

        default:
          break
      }
    }

    if (isLoading)
      return (
        <div>
          <Loading />
        </div>
      )

    handleExternalPopupToLogin()

    const finishedRegisterStep = user?.finishedRegisterStep

    switch (finishedRegisterStep) {
      case RegisterSteps.ChoosePages:
        return <CompletedInfo />

      case RegisterSteps.Install:
        return <FirstTime />

      case RegisterSteps.Register:
        return (
          <div tabIndex={0}>
            <ChooseLanguages />
          </div>
        )

      case RegisterSteps.ChooseLanguages:
        return <ChoosePages />

      default:
        return <FirstTime />
      // TODO: Network error/server error should be noticed.
      // TODO: Different login header while token is expired.
    }
  }

  function handleExternalPopupToLogin() {
    const isExternalPopupWindow = new URLSearchParams(window.location.search).get("external")
    if (!user && !isExternalPopupWindow) {
      chrome.windows.create(
        {
          type: "popup",
          url: `${chrome.runtime.getURL("pages/popup.html")}?external=true`,
          width: 800,
          height: 600,
          focused: true,
          left: window.screenLeft,
          top: window.screenTop,
        },
        () => {
          window.close()
        }
      )
    }

    chrome.windows.onFocusChanged.addListener(() => {
      chrome.windows.getLastFocused({ windowTypes: ["popup"] }, (window) => {
        window.id && user && chrome.windows.remove(window.id)
      })
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
          {renderPages()}
        </div>
      </Router>
    </GlobalContext.Provider>
  )
}

export default PopupPage
