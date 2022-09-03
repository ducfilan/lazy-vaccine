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
import { LoginTypes } from "@/common/consts/constants"
import { GlobalContext } from "@/common/contexts/GlobalContext"
import { getErrorView } from "../app/App"

const PopupPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http | null>(null)
  const [lastError, setLastError] = useState<any>(null)

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
    window.heap.track("Open popup")
  }, [])

  useEffect(() => {
    if (!http) return

    getMyInfo(http)
      .then((userInfo) => {
        setUser(userInfo)

        window.heap.identify(userInfo.email)
        window.heap.addUserProperties({ name: user?.name || "", finished_register_step: userInfo.finishedRegisterStep })
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

  function renderContent() {
    popupHeightScrollIssueWorkaround()

    if (lastError) return getErrorView(lastError, setLastError, <FirstTime />)

    if (isLoading)
      return (
        <div>
          <Loading />
        </div>
      )

    const finishedRegisterStep = user?.finishedRegisterStep

    switch (finishedRegisterStep) {
      case RegisterSteps.ChooseLanguages:
        return <CompletedInfo />

      case RegisterSteps.Install:
        return <FirstTime />

      case RegisterSteps.Register:
        return (
          <div tabIndex={0}>
            <ChooseLanguages />
          </div>
        )

      default:
        return <FirstTime />
    }
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
          {renderContent()}
        </div>
      </Router>
    </GlobalContext.Provider>
  )
}

export default PopupPage
