import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Button, Alert, Carousel } from "antd"
import { GoogleOutlined } from "@ant-design/icons"
import { signIn } from "@facades/authFacade"
import { i18n, LoginTypes } from "@consts/constants"
import { User } from "@/common/types/types"

import WanImg from "@img/emojis/shiba/wan.png"
import PopupHeader from "./Header"
import BlockQuote from "@/common/components/BlockQuote"
import { quotes } from "@/common/consts/quotes"

const { useState } = React

function FirstTime() {
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoginError, setIsShowLoginError] = useState(false)

  const { setUser, http } = useGlobalContext()

  function loginWithGoogle() {
    setIsLoading(true)
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
        <PopupHeader content={i18n("popup_introduce_first")} iconUrl={WanImg} />
        <div className="first-time-intro--login-button has-text-centered">
          <Button shape="round" icon={<GoogleOutlined />} size={"large"} loading={isLoading} onClick={loginWithGoogle}>
            {i18n("login_google")}
          </Button>
        </div>
      </div>

      <div className="first-time-intro--body-wrapper">
        <Alert
          message={i18n("error")}
          description={i18n("login_failed_message")}
          type="error"
          showIcon
          closable
          style={{ display: isShowLoginError ? "flex" : "none" }}
        />
        <Carousel autoplay>
          {quotes.map(({ quote, author }, i) => (
            <BlockQuote key={i} quote={quote} author={`- ${author}`} />
          ))}
        </Carousel>
      </div>
    </>
  )
}

export default FirstTime
