import * as React from "react"
const { useState, useEffect } = React

import { Cookies } from "react-cookie"

import "./css/popup.scss"

import { PopupContext } from "./contexts/PopupContext"

import Navbar from "@/common/components/Navbar"
import Loading from "@/common/components/Loading"
import FirstTime from "./components/FirstTime"
import ChooseLanguages from "./components/ChooseLanguages"
import ChoosePages from "./components/ChoosePages"
import CompletedInfo from "./components/CompletedInfo"

import CacheKeys from "@consts/cacheKeys"
import RegisterSteps from "@consts/registerSteps"

import { getUserInfo } from "@/common/api/user"
import { Language, User } from "@/common/types/types"

const cookies = new Cookies()

const PopupPage = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const isLoggedIn = cookies.get(CacheKeys.jwtToken) !== undefined

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true)

      try {
        let userInfo = await getUserInfo()

        setUser(userInfo)
      } catch (error) {
        // Not able to login with current token, ignore to show the first page to login.
      }

      setIsLoading(false)
    }

    isLoggedIn && fetchUserInfo()
  }, [])

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
    <PopupContext.Provider value={{ selectedLanguages, setSelectedLanguages, user, setUser }}>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} />
        {renderPages()}
      </div>
    </PopupContext.Provider>
  )
}

export default PopupPage
