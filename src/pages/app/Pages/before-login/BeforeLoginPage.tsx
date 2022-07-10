import React, { useState } from "react"

import { i18n, LoginTypes } from "@/common/consts/constants"
import ShibaTailImg from "@img/emojis/shiba/tail.png"
import { Button } from "antd"
import { GoogleOutlined } from "@ant-design/icons"

import { getGoogleAuthToken } from "@/common/facades/authFacade"
import { Http } from "@/common/facades/axiosFacade"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

export const BeforeLoginPage = () => {
  const { setHttp } = useGlobalContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

                  getGoogleAuthToken({ interactive: true })
                    .then((token: string) => {
                      setHttp!(new Http(token, LoginTypes.google))
                    })
                    .catch((error: any) => {
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
