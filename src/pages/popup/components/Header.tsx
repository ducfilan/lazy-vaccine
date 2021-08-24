import * as React from "react"

import { Typography } from "antd"

function PopupHeader({ content, iconUrl }: { content: string | React.ReactElement; iconUrl?: string }) {
  return (
    <div className="popup-header--wrapper has-text-centered">
      {iconUrl && <img src={iconUrl} className="is-absolute popup-header--icon-img" />}
      <div className="popup-header--title-wrapper">
        {typeof content === "string" ? (
          <Typography.Title level={2} className="popup-header--title">
            {content}
          </Typography.Title>
        ) : (
          content
        )}
      </div>
    </div>
  )
}

export default PopupHeader
