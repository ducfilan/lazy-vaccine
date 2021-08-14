import * as React from "react"

import { usePopupContext } from "../contexts/PopupContext"

import { Typography, Select, Row, Col } from "antd"

import { DefaultLangCode } from "@consts/constants"
import CacheKeys from "@consts/cacheKeys"
import SupportingLanguages from "@consts/supportingLanguages"
import useLocalStorage from "@hooks/useLocalStorage"
import { formatString, langCodeToName } from "@/common/utils/stringUtils"
import LanguageItem from "./LanguageItem"

const { useState } = React
const { Option } = Select

function ChooseLanguages() {
  const { user } = usePopupContext()

  const [choseLanguages, setChoseLanguages] = useState<string[]>([user?.locale || DefaultLangCode])
  const [, setFinishedRegisterStep] = useLocalStorage(CacheKeys.finishedRegisterStep)

  const headerText = formatString(chrome.i18n.getMessage("popup_introduce_choose_lang_1"), [
    { key: "user_name", value: user?.name || "" },
    { key: "first_language", value: langCodeToName(user?.locale) },
  ])

  const addLanguage = (langCode: string) => {
    const uniqueLangCodes = Array.from(new Set([...choseLanguages, langCode]).values())

    setChoseLanguages(uniqueLangCodes)
  }

  return (
    <>
      <div className="choose-languages--wrapper">
        <div className="choose-languages--header-info has-text-centered">
          <div className="choose-languages--title-wrapper">
            <Typography.Title level={2} className="title">
              {headerText}
            </Typography.Title>
          </div>
        </div>

        <div className="choose-languages--pages-list">
          <Row gutter={[16, 16]} className="choose-languages--selected-languages-wrapper">
            <Col span={12} offset={6}>
              {choseLanguages.map((code) => (
                <LanguageItem key={code} code={code} name={langCodeToName(code)} />
              ))}
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="choose-languages--selection-wrapper">
            <Col span={12} offset={6}>
              <Select
                showSearch
                className="choose-languages--dropdown-button"
                placeholder={chrome.i18n.getMessage("popup_select_a_language")}
                optionFilterProp="children"
                filterOption={(input, option) => option?.value.toLowerCase().includes(input.toLowerCase())}
                onChange={addLanguage}
              >
                {Object.values(SupportingLanguages.Set).map((language) => (
                  <Option key={language.code} value={language.code}>
                    {language.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <div className="column is-6">
            <div className="choose-languages--selected-languages-wrapper">
              <div className="each-in-selectedLanguagesCurrentPage">
                <div className="xxx-language-item"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChooseLanguages
