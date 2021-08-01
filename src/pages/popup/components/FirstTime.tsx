import * as React from "react"

import { Typography, Button } from "antd"

import { GoogleOutlined } from "@ant-design/icons"

import GoogleLogo from "../../../images/ui/fa/brands/google.svg"

function FirstTime() {
  return (
    <div className="first-time-intro--wrapper is-relative">
      <div className="first-time-intro--header-info has-text-centered">
        <div className="first-time-intro--title-wrapper">
          <Typography.Title level={2} className="title">
            Một chiều cuối thu nghe nắng trong tâm hồn, một trái tim vừa mở lời. Lại gần anh hơn nữa thay bao dấu yêu đã
            bao lần! Anh chỉ cần mỗi em mà thôi.
          </Typography.Title>
        </div>
      </div>
      <div className="first-time-intro--login-button has-text-centered">
        <Button shape="round" icon={<GoogleOutlined />} size={"large"}>
          Login with Google
        </Button>
      </div>
    </div>
  )
}

export default FirstTime
