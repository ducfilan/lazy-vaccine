import * as React from "react"

import { usePopupContext } from "../contexts/PopupContext"

import { Typography, Button, Alert, Image } from "antd"
import { GoogleOutlined } from "@ant-design/icons"
import { signIn } from "@/common/facades/authFacade"
import { LoginTypes } from "@consts/constants"
import { User } from "@/common/types/types"

import WanImg from "@img/emojis/shiba/wan.png"

const { useState } = React

function FirstTime() {
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoginError, setIsShowLoginError] = useState(false)

  const { setUser } = usePopupContext()

  function loginWithGoogle() {
    setIsShowLoginError(false)

    try {
      signIn.call({ setIsShowLoginError }, LoginTypes.google, (user: User) => {
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
        <Image src={WanImg} preview={false} className="is-absolute first-time-intro--wan-img" />
        <div className="first-time-intro--header-info has-text-centered">
          <div className="first-time-intro--title-wrapper">
            <Typography.Title level={2} className="title">
              {chrome.i18n.getMessage("popup_introduce_first")}
            </Typography.Title>
          </div>
        </div>
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
