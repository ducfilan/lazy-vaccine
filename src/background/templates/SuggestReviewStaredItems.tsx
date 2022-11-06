import React from "react"
import StarIcon from "@img/ui/fa/star-solid.svg"
import shibaGoUpIcon from "@img/emojis/shiba/go-up.png"

import "./css/suggest-review-stared-items.scss"
import { DisclaimerInfo } from "./common/DisclaimerInfo"
import { Button } from "antd"
import { TalkingShibText } from "./common/TalkingShibText"
import { i18n } from "@/common/consts/constants"

export const SuggestReviewStaredItems = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <div className="suggestion-card suggestion-review-stared-items-wrapper card-wrapper">
        <div className="lzv-triple-stars-wrapper" style={{ marginBottom: 16 }}>
          <StarIcon />
          <StarIcon />
          <StarIcon />
        </div>
        <div className="card--face">
          <TalkingShibText shibImgUrl={shibaGoUpIcon} text={i18n("suggest_review_stared_items")} />
        </div>
        <div className="is-center">
          <Button className="lzv-btn-review-starred-items" type="primary">{i18n("suggest_review_yes_button_1")}</Button>
          <Button className="lzv-btn-review-starred-items" type="link">{i18n("suggest_review_yes_button_2")}</Button>
        </div>
      </div>
    </div>
  )
}
