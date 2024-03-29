import React from "react"

import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Button, Skeleton } from "antd"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import { Popover } from "./common/Popover"
import { AppBasePath, AppPages, i18n } from "@/common/consts/constants"
import { CardInteraction } from "./common/CardInteraction"

export const QnATemplate = () => {
  return (
    <div className="lazy-vaccine" data-set-id=":setId" data-item-id=":itemId" data-answered="false" data-set-type=":setType">
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
              <a
                href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.TestSet.path}`}
                title=":setTitle"
                target={"_blank"}
              >
                {i18n("set_detail_test_set")}
              </a>
            </p>
          </>
        }
      />
      <Skeleton active loading className="lazy-vaccine-hidden" />
      <div className="qna-card qna-card-wrapper card-wrapper" data-answers={":listOfAnswers"}>
        <div className="card--content">
          <p className="card--question">{":question"}</p>
          <p>{i18n("inject_card_select")}</p>
          <div className="answer--wrapper">{":answerTemplate"}</div>
          <div className="check--wrapper">
            <Button type="primary" size="middle" className="check--btn">
              {i18n("common_check")}
            </Button>
          </div>
        </div>
      </div>

      <CardInteraction />
      <NextPrevButton direction="both" />
    </div>
  )
}
