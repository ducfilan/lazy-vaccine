import React, { useState } from "react"

import { i18n, LoginTypes } from "@/common/consts/constants"
import WanImg from "@img/emojis/shiba/wan.png"
import GoodImg from "@img/emojis/shiba/good.png"
import { Alert, Button, Carousel } from "antd"
import { GoogleOutlined } from "@ant-design/icons"

import BlockQuote from "@/common/components/BlockQuote"
import PopupHeader from "@/pages/popup/components/Header"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { clearLoginInfoCache, signIn } from "@/common/facades/authFacade"
import { User } from "@/common/types/types"

export default function FirstTime() {
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoginError, setIsShowLoginError] = useState(false)
  const [shibImg, setShibImg] = useState(WanImg)

  const { setUser, setHttp } = useGlobalContext()

  function loginWithGoogle() {
    setIsLoading(true)
    setIsShowLoginError(false)

    signIn
      .call({ setHttp }, LoginTypes.google)
      .then((u: User | null) => {
        setUser(u)
      })
      .catch((error) => {
        clearLoginInfoCache()
        console.error(error)
        setIsShowLoginError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <>
      <div className="first-time-intro--wrapper is-relative">
        <PopupHeader content={i18n("popup_introduce_first")} iconUrl={shibImg} />
        <div className="first-time-intro--login-button has-text-centered">
          <Button
            shape="round"
            icon={<GoogleOutlined />}
            size={"large"}
            loading={isLoading}
            onClick={loginWithGoogle}
            onMouseOver={() => setShibImg(GoodImg)}
            onMouseLeave={() => setTimeout(() => setShibImg(WanImg), 2000)}
          >
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
          {[
            { quote: i18n("first_page_quote_1"), author: "Duc Hoang" },
            { quote: i18n("first_page_quote_2"), author: "Lona" },
          ].map(({ quote, author }, i) => (
            <BlockQuote key={i} quote={quote} author={`- ${author}`} />
          ))}
        </Carousel>
      </div>
    </>
  )
}
