import React from "react"

import { DisclaimerInfo } from "./common/DisclaimerInfo"

import SetItemCardSmall from "./common/SetItemCardSmall"
import { TalkingShibText } from "./common/TalkingShibText"
import shibaWanIcon from "@img/emojis/shiba/wan.png"
import { i18n } from "@/common/consts/constants"

export const SuggestSetsTemplate = () => {
  return (
    <div className="lazy-vaccine" style={{ maxWidth: 300 }} data-set-id=":set__id" data-is-liked=":is_liked">
      <DisclaimerInfo />
      <SetItemCardSmall />
      <TalkingShibText
        shibImgUrl={shibaWanIcon}
        text={i18n("suggestion_subscribe_set")}
        style={{ position: "absolute", top: 210, padding: 10, fontSize: 15 }}
      />
    </div>
  )
}
