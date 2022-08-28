import React from "react"

import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import { Popover } from "./common/Popover"
import { AppBasePath, AppPages, i18n } from "@/common/consts/constants"
import { CardInteraction } from "./common/CardInteraction"

export const ContentTemplate = () => {
  return (
    <div className="lazy-vaccine" data-set-id=":setId" data-item-id=":itemId">
      <DisclaimerInfo />
      <Popover
        styles={{
          top: 10,
          right: -5,
          paddingLeft: 20,
        }}
        title={":setTitle"}
        showMoreButton={true}
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
                <a href="#" className="inject-card-next-set-link">
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
      <div className="content-card content-card-wrapper card-wrapper">
        <div className="card--face card--face--front">
          {":content"}
          <CardInteraction />
        </div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
