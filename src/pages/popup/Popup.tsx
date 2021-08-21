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

import CacheKeys from "@consts/cacheKeys"
import RegisterSteps from "@consts/registerSteps"

import { getUserInfo } from "@/common/api/user"
import { Language, User } from "@/common/types/types"

const cookies = new Cookies()

const PopupPage = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])
  const [user, setUser] = useState<User | null>(null)
  const isLoggedIn = cookies.get(CacheKeys.jwtToken) !== undefined

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        let userInfo = await getUserInfo()

        setUser(userInfo)
      } catch (error) {
        // Not able to login with current token, ignore to show the first page to login.
      }
    }

    isLoggedIn && fetchUserInfo()
  }, [])

  function renderPages() {
    const finishedRegisterStep = user?.finishedRegisterStep || RegisterSteps.Install

    switch (finishedRegisterStep) {
      case RegisterSteps.Install:
        return <FirstTime />

      case RegisterSteps.Register:
        return <ChooseLanguages />

      case RegisterSteps.ChooseLanguages:
        return <ChoosePages />

      default:
        return <Loading />
    }
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
