import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Button } from "antd"
import { ThunderboltFilled, MinusCircleOutlined, StarFilled } from "@ant-design/icons"
import * as React from "react"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import "./css/QandA.scss"
import { Popover } from "./common/Popover"
import { AppBasePath, AppPages, i18n } from "@/common/consts/constants"

export const QnATemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <Popover
        top={20}
        right={-4.4}
        paddingLeft={20}
        title={":setTitle"}
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
              <a href="#" className="flash-card-next-set-link">
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
      <div className="qna-card qna-card-wrapper" data-answers={":listOfAnswers"}>
        <div className="card--content">
          <p className="card--question">{":question"}</p>
          <div className="answer--wrapper">{":answerTemplate"}</div>
          <div className="check--wrapper">
            <Button type="primary" size="middle" className="check--btn">
              Check
            </Button>
          </div>
          <div className="card--interactions">
            <Button
              ghost
              type="primary"
              className="card--interactions--ignore"
              size="large"
              icon={<MinusCircleOutlined />}
            >
              Ignore
            </Button>

            <Button
              ghost
              type="primary"
              className="card--interactions--star :isStared"
              size="large"
              icon={<StarFilled />}
            ></Button>

            <Button
              ghost
              type="primary"
              className="card--interactions--got-it"
              size="large"
              icon={<ThunderboltFilled />}
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
