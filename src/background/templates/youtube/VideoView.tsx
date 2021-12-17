import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import * as React from "react"

import "./youtube.scss"

export const VideoViewTemplate = (props: { item: { type: string; [key: string]: any } }) => {
  return (
    <div className="lazy-vaccine">
      <div className="video-view-right flash-card-wrapper">
        <div className="card--face card--face--front">{props.item.term}</div>
        <div className="card--face card--face--back">{props.item.definition}</div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
