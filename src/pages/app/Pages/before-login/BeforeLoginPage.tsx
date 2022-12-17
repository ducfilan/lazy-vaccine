import React, { useState, useEffect } from "react"

import { i18n, LoginTypes } from "@/common/consts/constants"
import ShibaTailImg from "@img/emojis/shiba/tail.png"
import { Button } from "antd"
import { GoogleOutlined } from "@ant-design/icons"

import { clearLoginInfoCache, signIn } from "@/common/facades/authFacade"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { User } from "@/common/types/types"
import { TrackingNameOpenBeforeLoginPage } from "@/common/consts/trackingNames"
import { track } from "@amplitude/analytics-browser"

export const BeforeLoginPage = () => {
  const { setHttp, setUser } = useGlobalContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    track(TrackingNameOpenBeforeLoginPage)
  }, [])

  return (
    <div className="lazy-vaccine">
      <div className="before-login-card before-login-card-wrapper">
        <div className="card--face">
          <div className="shiba-img-wrapper">
            <img src={chrome.runtime.getURL(`${ShibaTailImg}`)} />
          </div>
          <div className="right-part-wrapper">
            <div className="talk-bubble tri-right left-in">
              <div className="talk-text">
                <p>{i18n("suggestion_card_not_logged_in_text")}</p>
              </div>
            </div>

            <div className="login-button-wrapper">
              <Button
                className="login-button"
                shape="round"
                icon={<GoogleOutlined />}
                size={"large"}
                loading={isLoading}
                onClick={() => {
                  setIsLoading(true)

                  signIn
                    .call({ setHttp }, LoginTypes.google)
                    .then((user: User | null) => {
                      setUser(user)
                    })
                    .catch((error: any) => {
                      clearLoginInfoCache()
                      console.error(error)
                    })
                    .finally(() => {
                      setIsLoading(false)
                    })
                }}
              >
                {i18n("login_google")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
