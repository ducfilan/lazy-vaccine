import * as React from "react"

import { usePopupContext } from "../contexts/PopupContext"

import { Typography, Button, Alert } from "antd"
import { GoogleOutlined } from "@ant-design/icons"
import { signIn } from "@/common/facades/authFacade"
import { LoginTypes } from "@consts/constants"
import RegisterSteps from "@consts/registerSteps"
import useLocalStorage from "@hooks/useLocalStorage"
import CacheKeys from "@consts/cacheKeys"
import { User } from "@/common/types/types"

const { useState } = React

function FirstTime() {
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoginError, setIsShowLoginError] = useState(false)
  const [, setFinishedRegisterStep] = useLocalStorage(CacheKeys.finishedRegisterStep)

  const { setUser } = usePopupContext()

  function loginWithGoogle() {
    setIsShowLoginError(false)

    try {
      signIn.call({ setIsShowLoginError }, LoginTypes.google, (user: User) => {
        setFinishedRegisterStep(RegisterSteps.Register)
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
