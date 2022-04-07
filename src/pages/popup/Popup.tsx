import * as React from "react"
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
import { getGoogleAuthToken } from "@facades/authFacade"
import { Http } from "@facades/axiosFacade"
import { LoginTypes } from "@/common/consts/constants"
import { GlobalContext } from "@/common/contexts/GlobalContext"

const PopupPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http>()

  useEffect(() => {
    try {
      setIsLoading(true)

      getGoogleAuthToken().then((token: string) => {
        setHttp(new Http(token, LoginTypes.google))
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
        setIsLoading(false)
      })
      .catch((error) => {
        setIsLoading(false)
        // Not able to login with current token, ignore to show the first page to login.
      })
  }, [http])

  function renderPages() {
    popupHeightScrollIssueWorkaround()

    if (isLoading) return <Loading />

    const finishedRegisterStep = user?.finishedRegisterStep

    switch (finishedRegisterStep) {
      case RegisterSteps.ChoosePages:
        return <CompletedInfo />

      case RegisterSteps.Install:
        return <FirstTime />

      case RegisterSteps.Register:
        return <ChooseLanguages />

      case RegisterSteps.ChooseLanguages:
        return <ChoosePages />

      default:
        return <FirstTime />
      // TODO: Network error/server error should be noticed.
      // TODO: Different login header while token is expired.
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
    <GlobalContext.Provider value={{ user, setUser, http }}>
      <div className="App">
        {!isLoading && <Navbar />}
        {renderPages()}
      </div>
    </GlobalContext.Provider>
  )
}

export default PopupPage
