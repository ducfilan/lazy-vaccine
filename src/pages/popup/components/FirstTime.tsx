import React, { useEffect } from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Button, Alert, Carousel } from "antd"
import { GoogleOutlined } from "@ant-design/icons"
import { clearLoginInfoCache, signIn } from "@facades/authFacade"
import { AppBasePath, AppPages, i18n, LoginTypes } from "@consts/constants"
import { User } from "@/common/types/types"

import WanImg from "@img/emojis/shiba/wan.png"
import GoodImg from "@img/emojis/shiba/good.png"
import PopupHeader from "./Header"
import BlockQuote from "@/common/components/BlockQuote"
import { redirectToUrlInNewTab } from "@/common/utils/domUtils"

const { useState } = React

function FirstTime() {
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoginError, setIsShowLoginError] = useState(false)
  const [shibImg, setShibImg] = useState(WanImg)

  const { setUser, setHttp } = useGlobalContext()

  useEffect(() => {
    const needToShowExternalPopup = new URLSearchParams(window.location.search).get("external") == null

    if (needToShowExternalPopup) {
      redirectToUrlInNewTab(`${chrome.runtime.getURL(AppBasePath)}${AppPages.GettingStarted.path}?source=popup`)
    }
  }, [])

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

export default FirstTime
