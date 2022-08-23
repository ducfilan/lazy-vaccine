import React from "react"

import { AppBasePath, AppPages, i18n } from "@/common/consts/constants"
import WakeImg from "@img/emojis/shiba/wake.png"
import LoveImg from "@img/emojis/shiba/love.png"
import { Carousel, Input } from "antd"

import PopupHeader from "@/pages/popup/components/Header"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { formatString } from "@/common/utils/stringUtils"

import PinGuideImg from "@img/ui/pin-guide.gif"

export default function FinishedGettingStarted() {
  const { user } = useGlobalContext()

  return (
    <>
      <div className="first-time-intro--wrapper is-relative">
        <PopupHeader
          content={formatString(i18n("popup_introduce_finished"), [{ key: "user_name", value: user?.name || "" }])}
          iconUrl={WakeImg}
        />
      </div>

      <div className="first-time-intro--body-wrapper">
        <Input.Search
          placeholder={i18n("suggestion_card_search_placeholder")}
          style={{ padding: "0 16px" }}
          size="large"
          enterButton
          onSearch={(keyword) => {
            window.heap.track("Done activation")
            window.open(
              `${chrome.runtime.getURL(AppBasePath)}${AppPages.Sets.path}?keyword=${encodeURIComponent(keyword)}`,
              "_self"
            )
          }}
        />
        <Carousel style={{ padding: "1em 3em" }}>
          <div className="talk-bubble tri-right left-in">
            <div className="talk-text">
              <p>{i18n("suggestion_pin_extension")}</p>
              <img src={chrome.runtime.getURL(`${PinGuideImg}`)} />
            </div>
          </div>
          <div className="talk-bubble tri-right left-in">
            <div className="talk-text">
              <p style={{ textAlign: "center" }}>{i18n("i_love_you")}</p>
              <img src={chrome.runtime.getURL(`${LoveImg}`)} style={{ width: "168px" }} />
            </div>
          </div>
        </Carousel>
      </div>
    </>
  )
}
