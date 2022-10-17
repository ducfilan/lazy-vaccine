import { AxiosResponse } from "axios"
import { SetInfo, GeneralInfoCounts, User, UserInteractionSetResponse, UserInteractionSetsResponse, LearningProgressInfo, SearchSetsResponse, SetInfoItem } from "@/common/types/types"
import { ApiClearCache, ApiCountInteractedItems, ApiGeneralInfoCounts, ApiGetInteractedItems, ApiGetUserInteractionSets, ApiItemsInteractions, ApiLogout, ApiMe, ApiRandomSet, ApiSuggestSets, ApiUsers } from "@consts/apis"
import StatusCode from "@consts/statusCodes"
import { Http } from "@facades/axiosFacade"
import { InteractionSubscribe, InteractionLike, InteractionDislike } from "@consts/constants"
import { NotSubscribedError } from "../consts/errors"

export async function getMyInfo(http: Http): Promise<User> {
  const response = await http.get<any, AxiosResponse<User>>(ApiMe)

  const userInfo = response?.data
  if (!userInfo) throw new Error("cannot get user info")

  return userInfo
}

export async function getUserInfo(http: Http, userId: string): Promise<User> {
  const response = await http.get<any, AxiosResponse<User>>(`${ApiUsers}/${userId}`)

  const userInfo = response?.data
  if (!userInfo) throw new Error("cannot get user info")

  return userInfo
}

export async function getUserInteractionSets(http: Http, userId: string, interaction: string, skip: number, limit: number): Promise<UserInteractionSetsResponse> {
  const response = await http.get<any, AxiosResponse<UserInteractionSetsResponse>>(ApiGetUserInteractionSets(userId, interaction, skip, limit))

  const result = response?.data
  if (!result) {
    throw new Error("cannot get user interaction sets")
  }

  if (!result.sets) {
    return {
      total: 0,
      sets: []
    } as UserInteractionSetsResponse
  }

  result.sets.forEach(({ set, actions }) => {
    set.isSubscribed = actions?.includes(InteractionSubscribe)
    set.isLiked = actions?.includes(InteractionLike)
    set.isDisliked = actions?.includes(InteractionDislike)

    return set
  })

  return result
}

export async function getUserInteractionRandomSet(http: Http, interaction: string, itemsSkip: number, itemsLimit: number): Promise<SetInfo> {
  const response = await http.get<any, AxiosResponse<UserInteractionSetResponse>>(ApiRandomSet(interaction, itemsSkip, itemsLimit))

  const result = response?.data
  if (!result) throw new Error("cannot get user interaction sets")

  const { actions, set } = result

  if (!set) {
    if (interaction === InteractionSubscribe) {
      throw new NotSubscribedError("not subscribed sets")
    }
  }

  set.isSubscribed = actions?.includes(InteractionSubscribe)
  set.isLiked = actions?.includes(InteractionLike)
  set.isDisliked = actions?.includes(InteractionDislike)

  return set
}

export async function updateUserInfo(http: Http, data: Object): Promise<boolean> {
  const { status } = await http.patch<any, AxiosResponse<boolean>>(ApiMe, data)

  return status === StatusCode.Ok
}

export async function logout(http: Http): Promise<boolean> {
  const { status } = await http.post<any, AxiosResponse>(ApiLogout)

  return status === StatusCode.Ok
}

export async function getLearningProgressInfo(http: Http, beginDate: string, endDate: string): Promise<LearningProgressInfo[]> {
  const response = await http.get<any, AxiosResponse<LearningProgressInfo[]>>(ApiItemsInteractions(beginDate, endDate))

  const learningProgressInfo = response?.data
  if (!learningProgressInfo) throw new Error("cannot get user statistics")

  return learningProgressInfo
}

export async function getGeneralInfoCounts(http: Http): Promise<GeneralInfoCounts> {
  const response = await http.get<any, AxiosResponse<GeneralInfoCounts | null>>(ApiGeneralInfoCounts);

  const generalInfoCounts = response?.data
  if (!generalInfoCounts) throw new Error("cannot get user statistics")

  return generalInfoCounts
}

export async function suggestSets(http: Http, keyword: string, languages: string[], skip: number, limit: number) {
  const response = await http.get<any, AxiosResponse<SearchSetsResponse>>(`${ApiSuggestSets}?keyword=${keyword}&languages=${languages.join(",")}&skip=${skip}&limit=${limit}`)

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

export async function countInteractedItems(http: Http, interactionInclude: string, interactionIgnore: string): Promise<number> {
  const response = await http.get<any, AxiosResponse<number>>(ApiCountInteractedItems(interactionInclude, interactionIgnore))

  const count = response?.data
  if (!count) return 0

  return count
}

export async function getInteractedItems(http: Http, interactionInclude: string, interactionIgnore: string, skip: number, limit: number): Promise<SetInfoItem[]> {
  const response = await http.get<any, AxiosResponse<SetInfoItem[]>>(ApiGetInteractedItems(interactionInclude, interactionIgnore, skip, limit))

  const items = response?.data
  if (!items) throw new Error("cannot get user statistics")

  return items
}

export async function clearServerCache(http: Http, cacheType: string): Promise<void> {
  await http.delete<any, AxiosResponse<SetInfoItem[]>>(ApiClearCache(cacheType))
}
