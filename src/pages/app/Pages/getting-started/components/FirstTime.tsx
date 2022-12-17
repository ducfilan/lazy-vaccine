import React, { useState } from "react"

import { i18n, LoginTypes, RegisterStepsLabels } from "@/common/consts/constants"
import WanImg from "@img/emojis/shiba/wan.png"
import GoodImg from "@img/emojis/shiba/good.png"
import { Alert, Button } from "antd"
import { GoogleOutlined } from "@ant-design/icons"

import PopupHeader from "@/pages/popup/components/Header"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { clearLoginInfoCache, signIn, signOut } from "@/common/facades/authFacade"
import { KeyValuePair, User } from "@/common/types/types"
import { TalkingShibText } from "@/background/templates/common/TalkingShibText"
import { formatString, getGreetingTime } from "@/common/utils/stringUtils"
import Clock from "@/common/components/Clock"
import FriendRoad from "@/pages/app/components/FriendRoad"
import { TrackingNameClickLoginButton } from "@/common/consts/trackingNames"
import { track } from "@amplitude/analytics-browser"

export default function FirstTime() {
  const [isLoading, setIsLoading] = useState(false)
  const [isShowLoginError, setIsShowLoginError] = useState(false)
  const [shibImg, setShibImg] = useState(WanImg)

  const { setUser, http, setHttp } = useGlobalContext()

  function loginWithGoogle() {
    track(TrackingNameClickLoginButton)

    setIsLoading(true)
    setIsShowLoginError(false)

    new Promise((resolve) => {
      if (http) {
        signOut(http, () => {
          setUser(null)
          setHttp(null)

          resolve(true)
        })
      } else {
        resolve(true)
      }
    }).finally(() => {
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
    })
  }

  return (
    <>
      <Clock
        parentProps={{
          textAlign: "center",
          position: "absolute",
          top: -90,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        textStyle={{
          marginBottom: 0,
          fontSize: 80,
          fontWeight: 700,
          color: "rgba(0, 0, 0, 0.5)",
        }}
      />
      <div className="first-time-intro--wrapper is-relative">
        <PopupHeader content={i18n("popup_introduce_first")} />
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
        <div className="first-time-intro--shib-self-intro">
          <TalkingShibText
            shibImgUrl={shibImg}
            text={formatString(i18n("popup_introduce_shib_self_intro"), [
              {
                key: "greeting_string",
                value: getGreetingTime(),
              },
            ] as KeyValuePair[])}
          />
        </div>
      </div>
      <FriendRoad steps={RegisterStepsLabels} />
    </>
  )
}
