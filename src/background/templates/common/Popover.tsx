import { Button } from "antd"
import * as React from "react"
import { MoreOutlined } from "@ant-design/icons"

export const Popover = ({
  title,
  content,
  top,
  right,
  paddingLeft,
}: {
  title: string
  content: React.ReactElement
  top: number
  right: number
  paddingLeft: number
}) => {
  return (
    <>
      <Button
        type="text"
        shape="circle"
        icon={<MoreOutlined style={{ color: "white" }} />}
        style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}
        className="flash-card-more-button"
      />

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
        <div>
          <div
            className="ant-popover ant-popover-placement-bottomRight ant-popover-hidden"
            style={{ top: top, right: right, paddingLeft: paddingLeft }}
          >
            <div className="ant-popover-content">
              <div className="ant-popover-arrow">
                <span className="ant-popover-arrow-content"></span>
              </div>
              <div className="ant-popover-inner" role="tooltip">
                <div className="ant-popover-title">
                  <span>{title}</span>
                </div>
                <div className="ant-popover-inner-content">
                  <div>{content}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
