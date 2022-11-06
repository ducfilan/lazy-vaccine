import React from "react"

import { DisclaimerInfo } from "./common/DisclaimerInfo"

import shibaSleepIcon from "@img/emojis/shiba/sleep.png"
import { TalkingShibText } from "./common/TalkingShibText"

export const NetworkErrorTemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <div className="suggestion-card suggestion-card-wrapper card-wrapper">
        <div className="card--face">
          <TalkingShibText shibImgUrl={shibaSleepIcon} text={":errorText"} />
        </div>
      </div>
    </div>
  )
}
