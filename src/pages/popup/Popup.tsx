import * as React from "react"
const { useState } = React

import "./popup.scss"

import { PopupContext } from "./contexts/PopupContext"

import Navbar from "../../common/components/Navbar"
import FirstTime from "./components/FirstTime"
import Language from "./types/Language"

const PopupPage = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])

  return (
    <PopupContext.Provider value={{ selectedLanguages, setSelectedLanguages }}>
      <div className="App">
        <Navbar isLoggedIn></Navbar>
        <FirstTime />
      </div>
    </PopupContext.Provider>
  )
}

export default PopupPage
