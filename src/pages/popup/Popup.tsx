import * as React from "react"
const { useState, useEffect } = React

import "./css/popup.scss"

import { GlobalContext } from "./contexts/GlobalContext"

import Navbar from "@/common/components/Navbar"
import Loading from "@/common/components/Loading"
import FirstTime from "./components/FirstTime"
import ChooseLanguages from "./components/ChooseLanguages"
import ChoosePages from "./components/ChoosePages"
import CompletedInfo from "./components/CompletedInfo"

import RegisterSteps from "@consts/registerSteps"

import { getUserInfo } from "@/common/api/user"
import { User } from "@/common/types/types"
import { getGoogleAuthToken } from "@/common/facades/authFacade"
import { Http } from "@/common/facades/axiosFacade"
import { LoginTypes } from "@/common/consts/constants"

const PopupPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [http, setHttp] = useState<Http>()

  useEffect(() => {
    try {
      setIsLoading(true)

      getGoogleAuthToken((token: string) => {
        setHttp(new Http(token, LoginTypes.google))
      }, {})
    } catch (error) {
      // Not able to login with current token, ignore to show the first page to login.
    }
  }, [])

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (http) {
        const userInfo = await getUserInfo(http)
        setUser(userInfo)
      }
    }

    try {
      fetchUserInfo()
    } catch (error) {
      // Not able to login with current token, ignore to show the first page to login.
    }

    setIsLoading(false)
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
