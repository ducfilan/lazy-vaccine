import React from "react"

import shibaSleepIcon from "@img/emojis/shiba/sleep.png"
import "./css/network-error.scss"

export default (props: { errorText: string }) => {
  return (
    <div className="network-error-card-wrapper">
      <div className="card--face">
        <img src={chrome.runtime.getURL(`${shibaSleepIcon}`)} style={{ width: 169, verticalAlign: "top" }} />
        <div className="talk-bubble tri-right left-in">
          <div className="talk-text">
            <p>{props.errorText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
