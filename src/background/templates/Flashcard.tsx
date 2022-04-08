import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Button } from "antd"
import { ThunderboltFilled, MinusCircleOutlined } from "@ant-design/icons"
import * as React from "react"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import "./css/flashcard.scss"
import { Popover } from "./common/Popover"
import { AppBasePath, AppPages } from "@/common/consts/constants"
import { toTitleCase } from "@/common/utils/stringUtils"

const i18n = chrome.i18n.getMessage

export const FlashCardTemplate = () => {
  return (
    <div className="lazy-vaccine" data-first-stack-id=":firstStackId">
      <DisclaimerInfo />
      <Popover
        top={20}
        right={-4.4}
        paddingLeft={20}
        title={toTitleCase(i18n("common_more"))}
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
              <a href="javascript:void()" className="flash-card-next-set-link">
                {i18n("flashcard_next_set")}
              </a>
            </p>
          </>
        }
      />
      <div className="flash-card flash-card-wrapper">
        <div className="card--face card--face--front">
          <p>{":term"}</p>
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
              className="card--interactions--got-it"
              size="large"
              icon={<ThunderboltFilled />}
            >
              Got it
            </Button>
          </div>
        </div>
        <div className="card--face card--face--back">
          <p>{":definition"}</p>
        </div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
