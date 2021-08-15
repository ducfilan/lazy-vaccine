import * as React from "react"

import { Button } from "antd"

import { LeftOutlined, RightOutlined } from "@ant-design/icons"

function NextPrevButton({
  direction,
  onNext,
  onPrev,
}: {
  direction: "left" | "right" | "both"
  onNext?: Function
  onPrev?: Function
}) {
  return (
    <div className="next-prev-buttons--wrapper">
      {["left", "both"].includes(direction) && (
        <Button
          type="primary"
          size="large"
          icon={<LeftOutlined />}
          className="next-prev-buttons--prev-button"
          onClick={() => onPrev && onPrev()}
        />
      )}

      {["right", "both"].includes(direction) && (
        <Button
          type="primary"
          size="large"
          icon={<RightOutlined />}
          className="next-prev-buttons--next-button"
          onClick={() => onNext && onNext()}
        />
      )}
    </div>
  )
}

export default NextPrevButton
