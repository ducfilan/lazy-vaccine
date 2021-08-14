import * as React from "react"
const { useState, useEffect } = React

import { Cookies } from "react-cookie"

import "./popup.scss"

import { PopupContext } from "./contexts/PopupContext"

import Navbar from "@/common/components/Navbar"
import FirstTime from "./components/FirstTime"
import ChooseLanguages from "./components/ChooseLanguages"

import CacheKeys from "@consts/cacheKeys"
import RegisterSteps from "@consts/registerSteps"

import { getUserInfo } from "@/common/api/user"
import { Language, User } from "@/common/types/types"

import useLocalStorage from "@hooks/useLocalStorage"

const cookies = new Cookies()

const PopupPage = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [finishedRegisterStep] = useLocalStorage(CacheKeys.finishedRegisterStep)
  const isLoggedIn = cookies.get(CacheKeys.jwtToken) !== undefined

  useEffect(() => {
    const fetchUserInfo = async () => {
      let userInfo = await getUserInfo()

      if (finishedRegisterStep > userInfo.finishedRegisterStep) {
        userInfo = { ...userInfo, finishedRegisterStep }
      }

      setUser(userInfo)
    }

    isLoggedIn && fetchUserInfo()
  }, [])

  function renderPages() {
    switch (user?.finishedRegisterStep) {
      case RegisterSteps.Register:
        return <ChooseLanguages />

      default:
        return <FirstTime />
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
