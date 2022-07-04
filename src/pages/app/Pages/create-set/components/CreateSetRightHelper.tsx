import * as React from "react"
import { Card, Carousel } from "antd"
import { FireFilled, QuestionCircleFilled, MessageFilled } from "@ant-design/icons"
import shibaTailIcon from "@img/emojis/shiba/tail.png"
import { i18n } from "@/common/consts/constants"

export const CreateSetRightHelper = () => {
  return (
    <>
      <Card className="create-set--right-card">
        <Carousel autoplay>
          <div>
            <h3>
              <QuestionCircleFilled style={{ color: "#2ecc71" }} /> {i18n("create_set_help_text_1_title")}
            </h3>
            <p className="create-set--help-text-content">{i18n("create_set_help_text_1_content")}</p>
          </div>
          <div>
            <h3>
              <FireFilled style={{ color: "#ffc000" }} /> {i18n("create_set_help_text_2_title")}
            </h3>
            <p className="create-set--help-text-content">{i18n("create_set_help_text_2_content")}</p>
          </div>
          <div>
            <h3>
              <MessageFilled style={{ color: "#3498db" }} /> {i18n("create_set_help_text_3_title")}
            </h3>
            <p className="create-set--help-text-content">{i18n("create_set_help_text_3_content")}</p>
            {/* TODO: Add youtube video support. */}
          </div>
        </Carousel>
        <div className="ant-popover-arrow">
          <span className="ant-popover-arrow-content"></span>
        </div>
      </Card>

      <div className="has-text-centered">
        <img
          src={shibaTailIcon}
          style={{
            width: "auto",
            height: "auto",
            fontSize: "169px",
          }}
        />
      </div>
    </>
  )
}
