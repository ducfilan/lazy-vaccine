import React from "react"

import { DisclaimerInfo } from "./common/DisclaimerInfo"

import { i18n } from "@/common/consts/constants"
import ShibaTailImg from "@img/emojis/shiba/tail.png"
import { Button } from "antd"
import { GoogleOutlined } from "@ant-design/icons"

export const SuggestLoginTemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <div className="suggestion-card suggestion-card-wrapper card-wrapper">
        <div className="card--face">
          <img src={chrome.runtime.getURL(`${ShibaTailImg}`)} style={{ width: 100, verticalAlign: "top" }} />
          <div className="talk-bubble tri-right left-in">
            <div className="talk-text">
              <p>{i18n("suggestion_card_not_logged_in_text")}</p>
            </div>
          </div>
        </div>
        <div className="login-button-wrapper">
          <Button className="login-button" shape="round" icon={<GoogleOutlined />} size={"large"}>
            {i18n("login_google")}
          </Button>
        </div>
      </div>
    </div>
  )
}
