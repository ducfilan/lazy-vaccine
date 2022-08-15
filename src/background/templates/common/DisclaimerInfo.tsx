import { i18n } from "@/common/consts/constants"
import * as React from "react"

import "../css/disclaimer-info.scss"

export const DisclaimerInfo = () => {
  return (
    <div className="disclaimer-info">
      <div className="buttons">
        <div className="close"></div>
        <div className="minimize"></div>
        <div className="maximize"></div>
      </div>
      {i18n("common_inject_card_disclaimer")}
    </div>
  )
}
