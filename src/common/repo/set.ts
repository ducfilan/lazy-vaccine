import { Http } from "@facades/axiosFacade"
import { SearchSetsResponse, SetInfo, SetsInCategoryResponse, TestResult, TopSetsResponse } from "@/common/types/types"
import { AxiosResponse } from "axios"
import { ApiGetSetsInCategory, ApiInteraction, ApiItemInteraction, ApiSets, ApiTopSets, ApiTopSetsInCategory, ApiUploadTestResult } from "@consts/apis"
import { ParamError } from "@consts/errors"
import { DefaultLangCode, InteractionDislike, InteractionLike, InteractionSubscribe, IntMax } from "@consts/constants"
import CacheKeys from "@consts/cacheKeys"

export async function createSet(http?: Http, setInfo?: SetInfo): Promise<string> {
  if (!http || !setInfo) throw new ParamError()

  const { data: insertedSetId } = await http.post<any, AxiosResponse<string>>(ApiSets, setInfo)

  return insertedSetId
}

export async function editSet(http?: Http, setInfo?: SetInfo): Promise<string> {
  if (!http || !setInfo) throw new ParamError()

  // Remove unnecessary info.
  const { creatorId, creatorName, lastUpdated, actions, itemsInteractions, isLiked, isDisliked, isSubscribed, ...setInfoMinimized } = setInfo

  await http.patch<any, AxiosResponse<string>>(ApiSets, setInfoMinimized)

  return setInfoMinimized._id
}

export async function getSetInfo(http: Http, setId: string, itemsSkip: number = 0, itemsLimit: number = IntMax): Promise<SetInfo> {
  if (!http || !setId) throw new ParamError()

  const response = await http.get<any, AxiosResponse<SetInfo>>(`${ApiSets}/${setId}?itemsSkip=${itemsSkip}&itemsLimit=${itemsLimit}`)

  const setInfo = response?.data
  if (!setInfo) throw new Error("cannot get set info")

  if ((setInfo.actions?.length || 0) > 0) {
    setInfo.isSubscribed = setInfo.actions?.includes(InteractionSubscribe)
    setInfo.isLiked = setInfo.actions?.includes(InteractionLike)
    setInfo.isDisliked = !setInfo.isLiked && setInfo.actions?.includes(InteractionDislike)
  }

  return setInfo
}

export async function getTopSets(http: Http, langCode: string = DefaultLangCode): Promise<SetInfo[]> {
  const response = await http.get<any, AxiosResponse<TopSetsResponse>>(ApiTopSets(langCode))

  if (!response?.data) throw new Error("cannot get top sets")

  let { topSets, interactions } = response?.data

  topSets.forEach((topSet) => {
    if (interactions) {
      const actions = interactions.find(interaction => interaction.setId === topSet._id)?.actions
      topSet.isSubscribed = actions?.includes(InteractionSubscribe)
      topSet.isLiked = actions?.includes(InteractionLike)
      topSet.isDisliked = !topSet.isLiked && actions?.includes(InteractionDislike)
    }
  })

  return topSets
}

export async function getTopSetsInCategory(http: Http, categoryId: string, langCode: string = DefaultLangCode): Promise<SetInfo[]> {
  const response = await http.get<any, AxiosResponse<TopSetsResponse>>(ApiTopSetsInCategory(langCode, categoryId))

  if (!response?.data) throw new Error(`cannot get top sets in category id: ${categoryId}, lang code: ${langCode}`)

  let { topSets, interactions } = response?.data

  topSets.forEach((topSet) => {
    if (interactions) {
      const actions = interactions.find(interaction => interaction.setId === topSet._id)?.actions
      topSet.isSubscribed = actions?.includes(InteractionSubscribe)
      topSet.isLiked = actions?.includes(InteractionLike)
    }
  })

  return topSets
}

export async function interactToSet(http: Http, setId: string, action: string): Promise<void> {
  await http.post<any, AxiosResponse<any>>(ApiInteraction(setId, action))
  chrome.storage.sync.remove([CacheKeys.showItemCount, CacheKeys.interactItemCount])
}

export async function undoInteractToSet(http: Http, setId: string, action: string): Promise<void> {
  await http.delete<any, AxiosResponse<any>>(ApiInteraction(setId, action))
}

export async function interactToSetItem(http: Http, setId: string, itemId: string, action: string): Promise<void> {
  await http.post<any, AxiosResponse<any>>(ApiItemInteraction(setId, itemId, action))
}

export async function searchSets(http: Http, keyword: string, languages: string[], skip: number, limit: number) {
  const response = await http.get<any, AxiosResponse<SearchSetsResponse>>(`${ApiSets}?keyword=${keyword}&languages=${languages.join(",")}&skip=${skip}&limit=${limit}`)

  if (!response?.data) throw new Error(`cannot search sets with keyword: ${keyword}`)

  let resp = response?.data

  resp.sets.forEach((set) => {
    if (resp.interactions) {
      const actions = resp.interactions.find(interaction => interaction.setId === set._id)?.actions
      set.isSubscribed = actions?.includes(InteractionSubscribe)
      set.isLiked = actions?.includes(InteractionLike)
      set.isDisliked = actions?.includes(InteractionDislike)
    }
  })

  return resp
}

export async function getSetsInCategory(http: Http, categoryId: string, skip: number, limit: number): Promise<SetsInCategoryResponse> {
  const response = await http.get<any, AxiosResponse<SetsInCategoryResponse>>(
    ApiGetSetsInCategory(categoryId, skip, limit)
  )
  if (!response?.data)
    throw new Error(`cannot get sets in category id: ${categoryId}`)
  return response?.data
}

export async function uploadTestResult(http: Http, setId: string, result: TestResult): Promise<void> {
  await http.post<any, AxiosResponse<any>>(ApiUploadTestResult(setId), result)
}