import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Button, Alert } from "antd"
import { GoogleOutlined } from "@ant-design/icons"
import { signIn } from "@facades/authFacade"
import { LoginTypes } from "@consts/constants"
import { User } from "@/common/types/types"

import WanImg from "@img/emojis/shiba/wan.png"
import PopupHeader from "./Header"

const { useState } = React

function FirstTime() {
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoginError, setIsShowLoginError] = useState(false)

  const { setUser, http } = useGlobalContext()

  function loginWithGoogle() {
    setIsShowLoginError(false)

    try {
      signIn.call({ http, setIsShowLoginError }, LoginTypes.google, (user: User) => {
        setUser(user)
      })
    } catch (error) {
      setIsShowLoginError(true)
    }

    setIsLoading(false)
  }

  return (
    <>
      <div className="first-time-intro--wrapper is-relative">
        <PopupHeader content={chrome.i18n.getMessage("popup_introduce_first")} iconUrl={WanImg} />
        <div className="first-time-intro--login-button has-text-centered">
          <Button shape="round" icon={<GoogleOutlined />} size={"large"} loading={isLoading} onClick={loginWithGoogle}>
            {chrome.i18n.getMessage("login_google")}
          </Button>
        </div>
      </div>

      <div className="first-time-intro--body-wrapper">
        <Alert
          message={chrome.i18n.getMessage("error")}
          description={chrome.i18n.getMessage("login_failed_message")}
          type="error"
          showIcon
          closable
          style={{ display: isShowLoginError ? "flex" : "none" }}
        />
      </div>
    </>
  )
}

export default FirstTime
