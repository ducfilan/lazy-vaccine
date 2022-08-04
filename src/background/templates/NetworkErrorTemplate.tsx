import React from "react"

import { DisclaimerInfo } from "./common/DisclaimerInfo"

import shibaSleepIcon from "@img/emojis/shiba/sleep.png"

export const NetworkErrorTemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <div className="suggestion-card suggestion-card-wrapper">
        <div className="card--face">
          <img src={chrome.runtime.getURL(`${shibaSleepIcon}`)} style={{ width: 169, verticalAlign: "top" }} />
          <div className="talk-bubble tri-right left-in">
            <div className="talk-text">
              <p>:errorText</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
