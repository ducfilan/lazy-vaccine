import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import * as React from "react"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import "./css/content.scss"
import { Popover } from "./common/Popover"
import { AppBasePath, AppPages, i18n } from "@/common/consts/constants"
import { CardInteraction } from "./common/CardInteraction"

export const ContentTemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <Popover
        top={20}
        right={-10}
        paddingLeft={20}
        title={":setTitle"}
        content={
          <>
            <div className="popover-links">
              <p>
                <a
                  href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.SetDetail.path}`}
                  title=":setTitle"
                  target={"_blank"}
                >
                  {i18n("flashcard_go_to_set")}
                </a>
              </p>
              <p>
                <a href="#" className="content-card-next-set-link">
                  {i18n("flashcard_next_set")}
                </a>
              </p>
              <p>
                <a href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.TestSet.path}`} target={"_blank"}>
                  {i18n("set_detail_test_set")}
                </a>
              </p>
            </div>
          </>
        }
      />
      <div className="content-card content-card-wrapper">
        <div className="card--face card--face--front">
          {":content"}
          <CardInteraction />
        </div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
