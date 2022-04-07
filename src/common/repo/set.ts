import { Http } from "../facades/axiosFacade"
import { SearchSetsResponse, SetInfo, TopSetsResponse } from "@/common/types/types"
import { AxiosResponse } from "axios"
import Apis from "@consts/apis"
import { ParamError } from "@consts/errors"
import { DefaultLangCode, InteractionDislike, InteractionLike, InteractionSubscribe } from "@consts/constants"

export async function createSet(http?: Http, setInfo?: SetInfo): Promise<string> {
  if (!http || !setInfo) throw new ParamError()

  const { data: insertedSetId } = await http.post<any, AxiosResponse<string>>(Apis.sets, setInfo)

  return insertedSetId
}

export async function editSet(http?: Http, setInfo?: SetInfo): Promise<string> {
  if (!http || !setInfo) throw new ParamError()

  // Remove unnecessary info.
  const { actions, creatorId, creatorName, interactionCount, isDisliked, isLiked, lastUpdated, isSubscribed, ...setInfoMinimized } = setInfo

  await http.patch<any, AxiosResponse<string>>(Apis.sets, setInfoMinimized)

  return setInfoMinimized._id
}

export async function getSetInfo(http: Http, setId: string): Promise<SetInfo> {
  if (!http || !setId) throw new ParamError()

  const response = await http.get<any, AxiosResponse<SetInfo>>(`${Apis.sets}/${setId}`)

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
  const response = await http.get<any, AxiosResponse<TopSetsResponse>>(Apis.topSets(langCode))

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

export async function getTopSetsInCategory(http: Http, langCode: string = DefaultLangCode, categoryId: string): Promise<SetInfo[]> {
  const response = await http.get<any, AxiosResponse<TopSetsResponse>>(Apis.topSetsInCategory(langCode, categoryId))

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
  await http.post<any, AxiosResponse<any>>(Apis.interaction(setId, action))
}

export async function undoInteractToSet(http: Http, setId: string, action: string): Promise<void> {
  await http.delete<any, AxiosResponse<any>>(Apis.interaction(setId, action))
}

export async function searchSets(http: Http, keyword: string) {
  const response = await http.get<any, AxiosResponse<SearchSetsResponse>>(`${Apis.sets}?keyword=${keyword}`)

  if (!response?.data) throw new Error(`cannot search sets with keyword: ${keyword}`)

  let { sets, interactions } = response?.data

  sets.forEach((set) => {
    if (interactions) {
      const actions = interactions.find(interaction => interaction.setId === set._id)?.actions
      set.isSubscribed = actions?.includes(InteractionSubscribe)
      set.isLiked = actions?.includes(InteractionLike)
    }
  })

  return sets
}