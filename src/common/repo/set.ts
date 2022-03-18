import { Http } from "../facades/axiosFacade"
import { SetInfo, TopSetsResponse } from "@/common/types/types"
import { AxiosResponse } from "axios"
import Apis from "@consts/apis"
import { ParamError } from "@consts/errors"
import { DefaultLangCode, InteractionLike, InteractionSubscribe } from "@consts/constants"

export async function createSet(http?: Http, setInfo?: SetInfo): Promise<string> {
  if (!http || !setInfo) throw new ParamError()

  const { data: insertedSetId } = await http.post<any, AxiosResponse<string>>(Apis.sets, setInfo)

  return insertedSetId
}

export async function getSetInfo(http: Http, setId: string): Promise<SetInfo> {
  if (!http || !setId) throw new ParamError()

  const response = await http.get<any, AxiosResponse<SetInfo>>(`${Apis.sets}/${setId}`)

  const setInfo = response?.data
  if (!setInfo) throw new Error("cannot get set info")

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

export async function subscribeToSet(http: Http, setId: string): Promise<void> {
  await http.post<any, AxiosResponse<any>>(Apis.subscription(setId))
}
