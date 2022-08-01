import React from "react"

import ShibaTailImg from "@img/emojis/shiba/tail.png"
import { Popover } from "./common/Popover"
import { AppBasePath, AppPages, ContactFeedbackLink, i18n } from "@/common/consts/constants"

export const FixedWidget = () => {
  return (
    <div className="lazy-vaccine-bubble">
      <Popover
        styles={{
          bottom: 200,
          right: 5,
          width: 220,
        }}
        title={i18n("bubble_widget_title")}
        position="topRight"
        content={
          <>
            <div className="popover-links">
              <p>
                <a href={ContactFeedbackLink} title={i18n("bubble_widget_send_feedback")} target={"_blank"}>
                  {i18n("bubble_widget_send_feedback")}
                </a>
              </p>
              <p>
                <a href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.Home.path}`} target={"_blank"}>
                  {i18n("suggestion_card_go_to_home")}
                </a>
              </p>
            </div>
          </>
        }
      />
      <img
        src={chrome.runtime.getURL(`${ShibaTailImg}`)}
        style={{ width: 60, verticalAlign: "top" }}
        className="bubble-img"
      />
    </div>
  )
}
