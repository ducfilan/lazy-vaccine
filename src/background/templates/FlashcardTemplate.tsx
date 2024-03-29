import React from "react"

import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Button, Divider, Skeleton } from "antd"
import Icon, { RedoOutlined, CopyOutlined } from "@ant-design/icons"
import { DisclaimerInfo } from "./common/DisclaimerInfo"
import SpeakerIcon from "@img/ui/fa/speaker.svg"

import { Popover } from "./common/Popover"
import {
  AppBasePath,
  AppPages,
  FlashCardOptions,
  i18n,
  SettingKeyBackItem,
  SettingKeyFrontItem,
} from "@/common/consts/constants"
import { SelectBox } from "./common/SelectBox"
import { CardInteraction } from "./common/CardInteraction"

const TopBar = () => {
  return (
    <div className="card-item--top-bar-wrapper">
      <Button type="primary" shape="circle" icon={<Icon component={SpeakerIcon} />} className="btn-pronounce" />
      <div />
      <div className="card-item--top-bar--right-wrapper">
        <Button shape="circle" icon={<RedoOutlined />} data-tooltip={i18n("common_flip")} className="btn-flip" />
        <Button shape="circle" icon={<CopyOutlined />} data-tooltip={i18n("common_copy")} className="btn-copy" />
      </div>
    </div>
  )
}

export const FlashcardTemplate = (props: { selectedFrontItem: string; selectedBackItem: string }) => {
  return (
    <div className="lazy-vaccine" data-set-id=":setId" data-item-id=":itemId" data-set-type=":setType">
      <DisclaimerInfo />
      <Popover
        styles={{
          top: 10,
          right: -5,
          paddingLeft: 20,
        }}
        title={":setTitle"}
        showMoreButton={true}
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
                <a href="#" className="inject-card-next-set-link">
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
                options={Object.entries(FlashCardOptions).map(([key, value]) => ({ key, value }))}
                settingKey={SettingKeyFrontItem}
              />
              <SelectBox
                label={i18n("flashcard_back_item")}
                hint={props.selectedBackItem}
                options={Object.entries(FlashCardOptions).map(([key, value]) => ({ key, value }))}
                settingKey={SettingKeyBackItem}
              />
            </div>
          </>
        }
      />
      <Skeleton active loading className="lazy-vaccine-hidden" />
      <div className="flash-card flash-card-wrapper card-wrapper">
        <div className="card--face card--face--front">
          <TopBar />
          <p className="card--content" data-lang=":langCodeFront">
            {":front_content"}
          </p>
        </div>
        <div className="card--face card--face--back">
          <TopBar />
          <p className="card--content" data-lang=":langCodeBack">
            {":back_content"}
          </p>
        </div>
      </div>
      <CardInteraction />
      <NextPrevButton direction="both" />
    </div>
  )
}
