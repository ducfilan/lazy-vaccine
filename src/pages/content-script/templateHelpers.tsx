import React from "react"

import { hrefToSiteName } from "@/background/DomManipulator"
import { ItemTypes, SettingKeyBackItem, SettingKeyFrontItem } from "@/common/consts/constants"
import { SetInfoItem, KeyValuePair } from "@/common/types/types"
import { encodeBase64, isValidJson } from "@/common/utils/stringUtils"
import { renderToString } from "react-dom/server"
import RichTextEditor from "@/pages/app/components/RichTextEditor"
import { getHref } from "./domHelpers"
import { sendGetLocalSettingMessage } from "./messageSenders"

export const toTemplateValues = async (
  item: SetInfoItem | null | undefined,
  otherKeyValueItems: { [key: string]: string } = {}
) => {
  if (!item) return []

  const itemKeyValue = await mapItemTemplateValues(item)
  let otherKeyValue = Object.entries(otherKeyValueItems).map(([key, value]) => ({ key, value } as KeyValuePair))
  otherKeyValue = [...otherKeyValue, { key: "website", value: await hrefToSiteName(getHref()) }]

  return [...itemKeyValue, ...otherKeyValue]
}

async function mapItemTemplateValues(item: SetInfoItem): Promise<KeyValuePair[]> {
  switch (item.type) {
    case ItemTypes.TermDef.value:
      let settingFrontItem = ((await sendGetLocalSettingMessage(SettingKeyFrontItem)) || "term").toString()

      let settingBackItem = ((await sendGetLocalSettingMessage(SettingKeyBackItem)) || "definition").toString()

      item.front_content = item[settingFrontItem]
      item.back_content = item[settingBackItem]

      const displayFaceToLangCodeMap = {
        term: item.fromLanguage,
        definition: item.toLanguage,
      } as { [key: string]: string }

      item.langCodeFront = displayFaceToLangCodeMap[settingFrontItem]
      item.langCodeBack = displayFaceToLangCodeMap[settingBackItem]

      delete item.term
      delete item.definition
      delete item.fromLanguage
      delete item.toLanguage

      break

    case ItemTypes.QnA.value:
      item.question = isValidJson(item.question)
        ? renderToString(<RichTextEditor readOnly value={item.question} />)
        : item.question
      break

    case ItemTypes.Content.value:
      item.content = renderToString(<RichTextEditor readOnly value={item.content} />)
      break
  }

  item.itemId = item._id
  return Object.entries(item).map(([key, value]) => ({ key, value } as KeyValuePair))
}

export function generateTemplateExtraValues(nextItem: SetInfoItem) {
  let commonValues = {
    setId: nextItem.setId,
    setTitle: nextItem.setTitle,
  }

  switch (nextItem.type) {
    case ItemTypes.TermDef.value:
      // Enough for this type.
      return commonValues

    case ItemTypes.QnA.value:
      if (!nextItem.answers || nextItem.answers.length === 0) {
        throw new Error("not enough answers")
      }

      return {
        ...commonValues,
        listOfAnswers: encodeBase64(JSON.stringify(nextItem.answers)),
        answerTemplate: nextItem.answers.map((answer) => `<div class="answer-btn">${answer.answer}</div>`).join(""),
        question: nextItem.question,
        correctAnswerCount: nextItem.answers.filter((answer) => answer.isCorrect).length || 1,
      }

    default:
      return {}
  }
}
