import React from "react"

import { DisclaimerInfo } from "./common/DisclaimerInfo"

import { i18n } from "@/common/consts/constants"
import UnImg from "@img/emojis/shiba/un.png"
import { Button } from "antd"
import { RocketOutlined } from "@ant-design/icons"

export const SuggestLoginTemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <div className="suggestion-card suggestion-card-wrapper card-wrapper">
        <div className="card--face">
          <img src={chrome.runtime.getURL(UnImg)} style={{ width: 100, verticalAlign: "top" }} />
          <div className="talk-bubble tri-right left-in">
            <div className="talk-text">
              <p>{i18n("suggestion_card_not_logged_in_text")}</p>
            </div>
          </div>
        </div>
        <div className="login-button-wrapper">
          <Button className="login-button" icon={<RocketOutlined />} size={"large"}>
            {i18n("suggestion_card_not_logged_in_btn")}
          </Button>
        </div>
      </div>
    </div>
  )
}
