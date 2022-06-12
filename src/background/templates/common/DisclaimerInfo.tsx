import { i18n } from "@/common/consts/constants"
import * as React from "react"

import "../css/disclaimer-info.scss"

export const DisclaimerInfo = () => {
  return <div className="disclaimer-info">{i18n("common_inject_card_disclaimer")}</div>
}
