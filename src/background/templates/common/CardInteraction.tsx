import { Button } from "antd"
import * as React from "react"
import { ThunderboltFilled, MinusCircleOutlined, StarFilled } from "@ant-design/icons"
import { i18n } from "@/common/consts/constants"

export const CardInteraction = () => {
  return (
    <div className="card--interactions">
      <Button ghost type="primary" className="card--interactions--ignore" size="large" icon={<MinusCircleOutlined />}>
        {i18n("common_ignore")}
      </Button>

      <Button
        ghost
        type="primary"
        className="card--interactions--star :isStared"
        size="large"
        icon={<StarFilled />}
      ></Button>

      <Button ghost type="primary" className="card--interactions--got-it" size="large" icon={<ThunderboltFilled />}>
        {i18n("common_got_it")}
      </Button>
    </div>
  )
}
