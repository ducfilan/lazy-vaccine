import { hrefToSiteName } from "@/background/DomManipulator"
import { SetInfoItem, KeyValuePair } from "@/common/types/types"
import { encodeBase64 } from "@/common/utils/stringUtils"
import { getHref } from "./domHelpers"

export const toTemplateValues = (item: SetInfoItem | null | undefined, otherKeyValueItems: { [key: string]: string } = {}) => {
  if (!item) return []

  const itemKeyValue = Object.entries(item).map(([key, value]) => ({ key, value } as KeyValuePair))
  let otherKeyValue = Object.entries(otherKeyValueItems).map(([key, value]) => ({ key, value } as KeyValuePair))
  otherKeyValue = [...otherKeyValue, { key: "website", value: hrefToSiteName(getHref()) }]

  return [...itemKeyValue, ...otherKeyValue]
}

export function generateItemValue(item: SetInfoItem) {
  return {
    setId: item.setId,
    setTitle: item.setTitle,
    listOfAnswers: item.answers ? encodeBase64(JSON.stringify(item?.answers)): '',
    answerTemplate: item.answers ? item.answers.map(answer => `<div class="answer-btn">${answer.answer}</div>`).join('') : ''
  }
}
