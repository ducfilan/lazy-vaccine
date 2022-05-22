import { hrefToSiteName } from "@/background/DomManipulator"
import { ItemTypes } from "@/common/consts/constants"
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
        answerTemplate: nextItem.answers.map(answer => `<div class="answer-btn">${answer.answer}</div>`).join(''),
        question: nextItem.question
      }

    default:
      return {}
  }
}
