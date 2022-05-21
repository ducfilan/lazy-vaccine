import { hrefToSiteName } from "@/background/DomManipulator"
import { ItemTypes } from "@/common/consts/constants"
import { SetInfoItem, KeyValuePair, SetInfo } from "@/common/types/types"
import { shuffleArray } from "@/common/utils/arrayUtils"
import { encodeBase64 } from "@/common/utils/stringUtils"
import { getHref } from "./domHelpers"

export const toTemplateValues = (item: SetInfoItem | null | undefined, otherKeyValueItems: { [key: string]: string } = {}) => {
  if (!item) return []

  const itemKeyValue = Object.entries(item).map(([key, value]) => ({ key, value } as KeyValuePair))
  let otherKeyValue = Object.entries(otherKeyValueItems).map(([key, value]) => ({ key, value } as KeyValuePair))
  otherKeyValue = [...otherKeyValue, { key: "website", value: hrefToSiteName(getHref()) }]

  return [...itemKeyValue, ...otherKeyValue]
}

export function generateItemValue(item: SetInfoItem, setInfo: SetInfo | null) {
  let qaConditionForTermDef = false
  if(setInfo && !item.answers && setInfo.items) {
    const termDefItems = setInfo.items.filter(item => item.type === ItemTypes.TermDef.value)
    if(termDefItems.length < 4) {
      return
    }
    const randomAnswersForTermDef = shuffleArray(termDefItems).slice(0, 3).map(item => {
      return {
        answer: item.definition
      }
    })
    item.answers = shuffleArray([...randomAnswersForTermDef, {
      isCorrect: true,
      answer: item.definition
    }])
    qaConditionForTermDef = true
  }
  return {
    setId: item.setId,
    setTitle: item.setTitle,
    listOfAnswers: item.answers ? encodeBase64(JSON.stringify(item?.answers)): '',
    answerTemplate: item.answers ? item.answers.map(answer => `<div class="answer-btn">${answer.answer}</div>`).join('') : '',
    isStared: item.isStared,
    qaConditionForTermDef: qaConditionForTermDef ? 'true' : '',
    question: item.term || item.question
  }
}
