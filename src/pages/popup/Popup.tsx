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
