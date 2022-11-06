import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { Select, Row, Col, notification, Card } from "antd"

import { DefaultLangCode, i18n, RegisterStepsLabels } from "@consts/constants"
import SupportingLanguages, { TopLanguages } from "@consts/supportingLanguages"
import { formatString, langCodeToName } from "@/common/utils/stringUtils"
import { KeyValuePair, User } from "@/common/types/types"
import RegisterSteps from "@/common/consts/registerSteps"
import { updateUserInfo } from "@/common/repo/user"
import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import PopupHeader from "@/pages/popup/components/Header"
import Flag from "@/common/components/Flag"
import FriendRoad from "@/pages/app/components/FriendRoad"

const { useState } = React
const { Option } = Select

function ChooseLanguages() {
  const { user, setUser, http } = useGlobalContext()

  const choseLangCodes = user?.langCodes || [user?.locale || DefaultLangCode]
  const choseDisplayedLanguages = choseLangCodes.map((code) => ({ code, isSelected: true }))
  const topDisplayedLanguages = TopLanguages.filter((code) => !choseLangCodes.includes(code)).map((code) => ({
    code,
    isSelected: false,
  }))

  const [displayedLanguages, setDisplayedLanguages] = useState<{ code: string; isSelected: boolean }[]>([
    ...choseDisplayedLanguages,
    ...topDisplayedLanguages,
  ])

  const getDisplayedLangCodes = () => displayedLanguages.map(({ code }) => code)

  const headerText = formatString(i18n("popup_introduce_choose_lang_codes"), [
    { key: "user_name", value: user?.name || "" },
    { key: "first_language", value: langCodeToName(user?.locale) },
  ])

  const addLanguage = (langCode: string) => {
    const displayedLangCodes = displayedLanguages.map((lang) => lang.code)
    const isNewLangCodeExisted = displayedLangCodes.includes(langCode)

    if (!isNewLangCodeExisted) {
      setDisplayedLanguages([...displayedLanguages, { code: langCode, isSelected: true }])
    }
  }

  const removeLanguage = (langCode: string) => {
    const remainingDisplayedLanguages = displayedLanguages.filter((language) => language.code !== langCode)

    // Keep at least one language.
    remainingDisplayedLanguages.length > 0 && setDisplayedLanguages(remainingDisplayedLanguages)
  }

  const goForward = async () => {
    try {
      if (!user) return

      let userLangCodes = displayedLanguages.filter((lang) => lang.isSelected).map((lang) => lang.code)
      if (userLangCodes.length === 0) userLangCodes = choseLangCodes

      const nextStep = RegisterSteps.next(user.finishedRegisterStep)
      const updatedUserInfo: User = {
        ...user,
        finishedRegisterStep: nextStep,
        langCodes: userLangCodes,
      }

      http && (await updateUserInfo(http, { finishedRegisterStep: nextStep, langCodes: userLangCodes }))

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
        <NextPrevButton direction={"right"} onNext={goForward} />

        <h3 className="choose-languages--title has-text-centered">
          {formatString(i18n("getting_started_top_languages"), [
            { key: "primary_language", value: langCodeToName(user?.locale || DefaultLangCode) },
          ] as KeyValuePair[])}
        </h3>

        <div className="choose-languages--top-languages-wrapper">
          <Card bordered={false}>
            {displayedLanguages.map(({ code, isSelected }, i) => (
              <Card.Grid key={code} hoverable={false}>
                <div className={`lzv--top-languages-item has-text-centered`}>
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      className="lzv--checkbox-input"
                      checked={isSelected}
                      data-lang-code={code}
                      onChange={(e) => {
                        const checkedCode = e.target.dataset.langCode
                        const isChecked = e.target.checked

                        if (!checkedCode) return

                        const updatedDisplayedLanguages = displayedLanguages.map((lang, i) =>
                          lang.code === checkedCode ? { code: checkedCode, isSelected: isChecked } : lang
                        )

                        setDisplayedLanguages(updatedDisplayedLanguages)

                        !isChecked && !TopLanguages.includes(checkedCode) && removeLanguage(checkedCode)
                      }}
                    />
                    <span className="lzv--checkbox-tile">
                      <span className="lzv--checkbox-icon">
                        <Flag langCode={code} />
                      </span>
                      <span className="lzv--checkbox-label">{langCodeToName(code)}</span>
                    </span>
                  </label>
                </div>
              </Card.Grid>
            ))}
          </Card>
        </div>

        <h3 className="choose-languages--title has-text-centered">{i18n("getting_started_other_languages")}</h3>

        <Row gutter={[16, 16]} className="choose-languages--selection-wrapper">
          <Col span={12} offset={6}>
            <Select
              showSearch
              className="choose-languages--dropdown-button"
              placeholder={i18n("popup_select_a_language")}
              optionFilterProp="children"
              filterOption={(input, option) => `${option?.value || ""}`.toLowerCase().includes(input.toLowerCase())}
              onChange={addLanguage}
            >
              {Object.values(SupportingLanguages.Set)
                .filter(({ code }) => !getDisplayedLangCodes().includes(code))
                .map(({ code, name }) => (
                  <Option key={code} value={code}>
                    {name}
                  </Option>
                ))}
            </Select>
          </Col>
        </Row>
      </div>
      <FriendRoad steps={RegisterStepsLabels} />
    </div>
  )
}

export default ChooseLanguages
