import React from "react"

import { DisclaimerInfo } from "./common/DisclaimerInfo"

import { AppBasePath, AppPages, i18n } from "@/common/consts/constants"
import ShibaBoxImg from "@img/emojis/shiba/box.png"
import { Input } from "antd"

const { Search } = Input

export const SuggestSubscribeTemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <div className="suggestion-card suggestion-card-wrapper card-wrapper">
        <div className="card--face">
          <img src={chrome.runtime.getURL(`${ShibaBoxImg}`)} style={{ width: 100, verticalAlign: "top" }} />
          <div className="talk-bubble tri-right left-in">
            <div className="talk-text">
              <p>{i18n("suggestion_card_suggestion_text")}</p>
            </div>
          </div>
        </div>
        <Search placeholder={i18n("suggestion_card_search_placeholder")} style={{ marginBottom: "20px" }} enterButton />
        <p>
          <a href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.Home.path}`} target={"_blank"}>
            {i18n("suggestion_card_go_to_home")}
          </a>
        </p>
      </div>
    </div>
  )
}
