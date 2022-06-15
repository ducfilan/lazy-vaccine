import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Button, Divider } from "antd"
import { ThunderboltFilled, MinusCircleOutlined, StarFilled } from "@ant-design/icons"
import * as React from "react"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

import "./css/flashcard.scss"
import { Popover } from "./common/Popover"
import { AppBasePath, AppPages, i18n, SettingKeyBackItem, SettingKeyFrontItem } from "@/common/consts/constants"
import { SelectBox } from "./common/SelectBox"

export const FlashCardTemplate = (props: { selectedFrontItem: string; selectedBackItem: string }) => {
  return (
    <div className="lazy-vaccine">
      <DisclaimerInfo />
      <Popover
        top={20}
        right={-10}
        paddingLeft={20}
        title={":setTitle"}
        content={
          <>
            <div className="popover-links">
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
                <a href={`${chrome.runtime.getURL(AppBasePath)}${AppPages.TestSet.path}`} target={"_blank"}>
                  {i18n("set_detail_test_set")}
                </a>
              </p>
            </div>
            <div className="popover-settings">
              <Divider plain>{i18n("flashcard_other_options")}</Divider>
              <SelectBox
                label={i18n("flashcard_front_item")}
                hint={props.selectedFrontItem}
                options={[
                  { key: "term", value: i18n("common_term") },
                  { key: "definition", value: i18n("common_definition") },
                ]}
                settingKey={SettingKeyFrontItem}
              />
              <SelectBox
                label={i18n("flashcard_back_item")}
                hint={props.selectedBackItem}
                options={[
                  { key: "term", value: i18n("common_term") },
                  { key: "definition", value: i18n("common_definition") },
                ]}
                settingKey={SettingKeyBackItem}
              />
            </div>
          </>
        }
      />
      <div className="flash-card flash-card-wrapper">
        <div className="card--face card--face--front">
          <p className="card--content">{":front_content"}</p>
          <div className="card--interactions">
            <Button
              ghost
              type="primary"
              className="card--interactions--ignore"
              size="large"
              icon={<MinusCircleOutlined />}
            >
              {i18n("common_ignore")}
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
              {i18n("common_got_it")}
            </Button>
          </div>
        </div>
        <div className="card--face card--face--back">
          <p className="card--content">{":back_content"}</p>
        </div>
      </div>
      <NextPrevButton direction="both" />
    </div>
  )
}
