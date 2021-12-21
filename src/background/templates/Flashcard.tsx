import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Button } from "antd"
import { ThunderboltFilled, MinusCircleOutlined } from "@ant-design/icons"
import * as React from "react"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import "./css/flashcard.scss"

export const FlashCardTemplate = () => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo website="test" />
      <div className="flash-card flash-card-wrapper">
        <div className="card--face card--face--front">
          {":term"}
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
        <div className="card--face card--face--back">{":definition"}</div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
