import { Button } from "antd"
import React from "react"
import { MoreOutlined } from "@ant-design/icons"

export const Popover = ({
  title,
  content,
  styles,
  position,
  showMoreButton,
}: {
  title: string
  content: React.ReactElement
  styles: {
    top?: number
    right?: number
    bottom?: number
    left?: number
    width?: number | string
    paddingLeft?: number
  }
  position?: string
  showMoreButton: boolean
}) => {
  return (
    <>
      {showMoreButton && (
        <Button
          type="text"
          shape="circle"
          icon={<MoreOutlined style={{ color: "white" }} />}
          style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}
          className="inject-card-more-button"
        />
      )}

      <div style={{ position: "absolute", ...styles, width: styles.width || "100%" }}>
        <div>
          <div
            className={`ant-popover ant-popover-placement-${position || "bottomRight"} ant-popover-hidden`}
            style={styles}
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
