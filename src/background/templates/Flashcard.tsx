import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Button } from "antd"
import { ThunderboltFilled, MinusCircleOutlined, StarFilled } from "@ant-design/icons"
import * as React from "react"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import "./css/flashcard.scss"
import { Popover } from "./common/Popover"
import { AppBasePath, AppPages } from "@/common/consts/constants"

const i18n = chrome.i18n.getMessage

export const FlashCardTemplate = () => {
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
          </>
        }
      />
      <div className="flash-card flash-card-wrapper">
        <div className="card--face card--face--front">
          <p className="card--content">{":term"}</p>
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
            >
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
          <p className="card--content">{":definition"}</p>
        </div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
