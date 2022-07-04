import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Select, Row, Col, notification } from "antd"

import { DefaultLangCode, i18n } from "@consts/constants"
import SupportingLanguages from "@consts/supportingLanguages"
import { formatString, langCodeToName } from "@/common/utils/stringUtils"
import LanguageItem from "./LanguageItem"
import NextPrevButton from "./NextPrevButton"
import { User } from "@/common/types/types"
import RegisterSteps from "@/common/consts/registerSteps"
import { updateUserInfo } from "@/common/repo/user"
import PopupHeader from "./Header"

const { useState } = React
const { Option } = Select

function ChooseLanguages() {
  const { user, setUser, http } = useGlobalContext()

  const [choseLanguages, setChoseLanguages] = useState<string[]>(user?.langCodes || [user?.locale || DefaultLangCode])

  const headerText = formatString(i18n("popup_introduce_choose_lang_codes"), [
    { key: "user_name", value: user?.name || "" },
    { key: "first_language", value: langCodeToName(user?.locale) },
  ])

  const addLanguage = (langCode: string) => {
    const uniqueLangCodes = Array.from(new Set([...choseLanguages, langCode]).values())
    setChoseLanguages(uniqueLangCodes)
  }

  const removeLanguage = (langCode: string) => {
    const removedLanguageCodes = choseLanguages.filter((language) => language !== langCode)

    // Keep at least one language.
    removedLanguageCodes.length > 0 && setChoseLanguages(removedLanguageCodes)
  }

  const goForward = async () => {
    try {
      if (!user) return

      const nextStep = RegisterSteps.next(user.finishedRegisterStep)
      const updatedUserInfo: User = {
        ...user,
        finishedRegisterStep: nextStep,
        langCodes: choseLanguages,
      }

      http && (await updateUserInfo(http, { finishedRegisterStep: nextStep, langCodes: choseLanguages }))

      setUser(updatedUserInfo)
    } catch (error) {
      // TODO: Handle more types of error: Server/Timeout/Network etc..
      notification["error"]({
        message: i18n("error"),
        description: i18n("unexpected_error_message"),
        duration: null,
      })
    }
  }

  return (
    <div className="choose-languages--wrapper">
      <PopupHeader content={headerText} />

      <div className="choose-languages--pages-list">
        <NextPrevButton direction={"right"} onNext={async () => await goForward()} />

        <Row gutter={[16, 16]} className="choose-languages--selected-languages-wrapper">
          <Col span={12} offset={6}>
            {choseLanguages.map((code, i) => (
              <LanguageItem
                isRemovable={i > 0}
                key={code}
                code={code}
                name={langCodeToName(code)}
                onRemove={removeLanguage}
              />
            ))}
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="choose-languages--selection-wrapper">
          <Col span={12} offset={6}>
            <Select
              showSearch
              className="choose-languages--dropdown-button"
              placeholder={i18n("popup_select_a_language")}
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
      </div>
    </div>
  )
}

export default ChooseLanguages
