import React from "react"

import "../css/talking-shib-text.scss"

export const TalkingShibText = ({
  shibImgUrl,
  text,
  ...othersProps
}: {
  shibImgUrl: string
  text: string
  [key: string]: any
}) => {
  return (
    <div className="talking-shib-wrapper" {...othersProps}>
      <img
        src={chrome.runtime.getURL(shibImgUrl)}
        style={{
          width: "100%",
          maxWidth: 169,
          minWidth: 60,
          verticalAlign: "top",
        }}
      />
      <div className="talk-bubble tri-right left-in">
        <div className="talk-text">
          <p>{text}</p>
        </div>
      </div>
    </div>
  )
}
