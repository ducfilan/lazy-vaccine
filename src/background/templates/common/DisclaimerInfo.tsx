import * as React from "react"

import "../css/disclaimer-info.scss"

const i18n = chrome.i18n.getMessage

export const DisclaimerInfo = () => {
  return <div className="disclaimer-info">{i18n("common_inject_card_disclaimer")}</div>
}
