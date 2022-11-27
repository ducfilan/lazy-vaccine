import React from "react"

import {
  ColorPrimary,
  DefaultImage,
  FlashCardOptions,
  i18n,
  ItemTypes,
  OtherItemTypes,
  SettingKeyBackItem,
  SettingKeyFrontItem,
} from "@/common/consts/constants"
import { SetInfoItem, KeyValuePair, SetInfo, User } from "@/common/types/types"
import { encodeBase64, isValidJson } from "@/common/utils/stringUtils"
import { renderToString } from "react-dom/server"
import RichTextEditor from "@/pages/app/components/RichTextEditor"
import { sendGetLocalSettingMessage, sendGetRecommendationsMessage } from "./messageSenders"
import { ChooseLanguagesStep } from "@/common/consts/registerSteps"
import { ContentTemplate } from "@/background/templates/ContentTemplate"
import { FlashcardTemplate } from "@/background/templates/FlashcardTemplate"
import { NetworkErrorTemplate } from "@/background/templates/NetworkErrorTemplate"
import { QnATemplate } from "@/background/templates/QandATemplate"
import { SuggestLoginTemplate } from "@/background/templates/SuggestLoginTemplate"
import { SuggestSetsTemplate } from "@/background/templates/SuggestSetsTemplate"
import { SuggestSubscribeTemplate } from "@/background/templates/SuggestSubscribeTemplate"
import { SuggestReviewStaredItems } from "@/background/templates/SuggestReviewStaredItems"
import {
  TrackingNameRenderQnAItem,
  TrackingNameRenderContentItem,
  TrackingNameRenderNotLoggedInItem,
  TrackingNameRenderNotSubscribedItem,
  TrackingNameRenderNotNetworkErrorItem,
  TrackingNameRenderSuggestionSetsItem,
  TrackingNameRenderSuggestionReviewStaredItemsItem,
} from "@/common/consts/trackingNames"
import { trackUserBehavior } from "@/common/utils/utils"

export async function getTemplateFromType(type: string) {
  console.debug("getTemplate called, type: " + type)

  switch (type) {
    case ItemTypes.TermDef.value:
      const frontItemSettingKey = (await sendGetLocalSettingMessage(SettingKeyFrontItem)) || ""
      const backItemSettingKey = (await sendGetLocalSettingMessage(SettingKeyBackItem)) || ""

      let settingFrontItem = FlashCardOptions[frontItemSettingKey] || i18n("select")
      let settingBackItem = FlashCardOptions[backItemSettingKey] || i18n("select")

      return renderToString(
        <FlashcardTemplate selectedFrontItem={settingFrontItem} selectedBackItem={settingBackItem} />
      )

    case ItemTypes.QnA.value:
      trackUserBehavior(TrackingNameRenderQnAItem)
      return renderToString(<QnATemplate />)

    case ItemTypes.Content.value:
      trackUserBehavior(TrackingNameRenderContentItem)
      return renderToString(<ContentTemplate />)

    case OtherItemTypes.NotLoggedIn.value:
      trackUserBehavior(TrackingNameRenderNotLoggedInItem)
      return renderToString(<SuggestLoginTemplate />)

    case OtherItemTypes.NotSubscribed.value:
      trackUserBehavior(TrackingNameRenderNotSubscribedItem)
      return renderToString(<SuggestSubscribeTemplate />)

    case OtherItemTypes.NetworkTimeout.value:
    case OtherItemTypes.NetworkOffline.value:
      trackUserBehavior(TrackingNameRenderNotNetworkErrorItem)
      return renderToString(<NetworkErrorTemplate />)

    case OtherItemTypes.SuggestionSets.value:
      trackUserBehavior(TrackingNameRenderSuggestionSetsItem)
      return renderToString(<SuggestSetsTemplate />)

    case OtherItemTypes.ReviewStaredItems.value:
      trackUserBehavior(TrackingNameRenderSuggestionReviewStaredItemsItem)
      return renderToString(<SuggestReviewStaredItems />)

    default:
      return ""
  }
}

export const toTemplateValues = async (
  item: SetInfoItem | null | undefined,
  otherKeyValueItems: { [key: string]: string } = {}
) => {
  if (!item) return []

  const itemKeyValue = await mapItemTemplateValues(item)
  let otherKeyValue = Object.entries(otherKeyValueItems).map(([key, value]) => ({ key, value } as KeyValuePair))

  return [...itemKeyValue, ...otherKeyValue]
}

async function mapItemTemplateValues(item: SetInfoItem): Promise<KeyValuePair[]> {
  switch (item.type) {
    case ItemTypes.TermDef.value:
      try {
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
      } catch (error) {
        console.error(error)
      }

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

export const getNotLoggedInTemplateValues = async () => {
  return [{ key: "type", value: OtherItemTypes.NotLoggedIn.value }]
}

export const getNotSubscribedTemplateValues = async () => {
  return [{ key: "type", value: OtherItemTypes.NotSubscribed.value }]
}

export const getNetworkErrorTemplateValues = async (lastError: any) => {
  switch (lastError?.error?.code) {
    case "ECONNABORTED":
      if (lastError?.error?.message?.startsWith("timeout of")) {
        return [
          { key: "type", value: OtherItemTypes.NetworkTimeout.value },
          { key: "errorText", value: i18n("network_error_timeout") },
        ]
      }
      return []

    case "ERR_NETWORK":
      return [
        { key: "type", value: OtherItemTypes.NetworkOffline.value },
        { key: "errorText", value: i18n("network_error_offline") },
      ]

    default:
      return []
  }
}

export function getRecommendationTemplateValues(setInfo: SetInfo | null, identity: User | null) {
  return new Promise<KeyValuePair[]>((resolve, reject) => {
    if (!setInfo) {
      reject("No setInfo provided")
    } else {
      const isFinishedRegistration = identity?.finishedRegisterStep == ChooseLanguagesStep
      const languages = isFinishedRegistration ? identity?.langCodes || [] : []

      sendGetRecommendationsMessage((setInfo.tags || [setInfo.name]).join(" "), languages, 0, 1)
        .then(({ sets }) => {
          const set = sets[0] as SetInfo

          resolve([
            { key: "type", value: OtherItemTypes.SuggestionSets.value },
            { key: "set_name", value: set.name },
            { key: "set_imgUrl", value: set.imgUrl || DefaultImage },
            { key: "subscribe_text", value: i18n("common_subscribe") },
            { key: "is_liked", value: (set.isLiked || false).toString() },
            { key: "like_color", value: set.isLiked ? ColorPrimary : "grey" },
            { key: "dislike_color", value: "grey" },
            { key: "set_creatorImageUrl", value: set.creatorImageUrl || "" },
            { key: "set__id", value: set._id },
            { key: "set_description", value: set?.description || i18n("set_detail_no_desc") },
          ])
        })
        .catch((error) => {
          console.error(error)
          reject(error)
        })
    }
  })
}

export function getSuggestReviewTemplateValues(starCount: number): KeyValuePair[] {
  return [
    { key: "type", value: OtherItemTypes.ReviewStaredItems.value },
    { key: "star_count", value: starCount.toString() },
  ]
}
