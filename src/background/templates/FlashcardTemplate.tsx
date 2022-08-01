import React from "react"

import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import { Divider } from "antd"
import { DisclaimerInfo } from "./common/DisclaimerInfo"

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

export const FlashcardTemplate = (props: { selectedFrontItem: string; selectedBackItem: string }) => {
  return (
    <div className="lazy-vaccine" data-setId=":setId" data-itemId=":itemId">
      <DisclaimerInfo />
      <Popover
        styles={{
          top: 10,
          right: -5,
          paddingLeft: 20,
        }}
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
      <div className="flash-card flash-card-wrapper">
        <div className="card--face card--face--front">
          <p className="card--content">{":front_content"}</p>
        </div>
        <div className="card--face card--face--back">
          <p className="card--content">{":back_content"}</p>
        </div>
      </div>
      <CardInteraction />
      <NextPrevButton direction="both" />
    </div>
  )
}
