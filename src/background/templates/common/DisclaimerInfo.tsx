import * as React from "react"
import { formatString } from "@/common/utils/stringUtils"

import "../css/disclaimer-info.scss"

const i18n = chrome.i18n.getMessage

export const DisclaimerInfo = (props: { website: string }) => {
  return (
    <div className="disclaimer-info">
      {formatString(i18n("common_inject_card_disclaimer"), [
        {
          key: "website",
          value: props.website,
        },
      ])}
    </div>
  )
}
