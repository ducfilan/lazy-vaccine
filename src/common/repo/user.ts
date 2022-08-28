import { AxiosResponse } from "axios"
import { SetInfo, GeneralInfoCounts, User, UserInteractionSetResponse, UserInteractionSetsResponse, LearningProgressInfo, SearchSetsResponse } from "@/common/types/types"
import Apis from "@consts/apis"
import StatusCode from "@consts/statusCodes"
import { Http } from "@facades/axiosFacade"
import { InteractionSubscribe, InteractionLike, InteractionDislike } from "@consts/constants"
import { NotSubscribedError } from "../consts/errors"

export async function getMyInfo(http: Http): Promise<User> {
  const response = await http.get<any, AxiosResponse<User>>(Apis.me)

  const userInfo = response?.data
  if (!userInfo) throw new Error("cannot get user info")

  return userInfo
}

export async function getUserInfo(http: Http, userId: string): Promise<User> {
  const response = await http.get<any, AxiosResponse<User>>(`${Apis.users}/${userId}`)

  const userInfo = response?.data
  if (!userInfo) throw new Error("cannot get user info")

  return userInfo
}

export async function getUserInteractionSets(http: Http, userId: string, interaction: string, skip: number, limit: number): Promise<UserInteractionSetsResponse> {
  const response = await http.get<any, AxiosResponse<UserInteractionSetsResponse>>(Apis.getUserInteractionSets(userId, interaction, skip, limit));

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

export async function getUserInteractionRandomSet(http: Http, interaction: string): Promise<SetInfo> {
  const response = await http.get<any, AxiosResponse<UserInteractionSetResponse>>(Apis.randomSet(interaction))

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
  const { status } = await http.patch<any, AxiosResponse<boolean>>(Apis.me, data)

  return status === StatusCode.Ok
}

export async function getLearningProgressInfo(http: Http, beginDate: string, endDate: string): Promise<LearningProgressInfo[]> {
  const response = await http.get<any, AxiosResponse<LearningProgressInfo[]>>(Apis.itemsInteractions(beginDate, endDate));

  const learningProgressInfo = response?.data
  if (!learningProgressInfo) throw new Error("cannot get user statistics")

  return learningProgressInfo
}

export async function getGeneralInfoCounts(http: Http): Promise<GeneralInfoCounts> {
  const response = await http.get<any, AxiosResponse<GeneralInfoCounts | null>>(Apis.generalInfoCounts);

  const generalInfoCounts = response?.data
  if (!generalInfoCounts) throw new Error("cannot get user statistics")

  return generalInfoCounts
}

export async function suggestSets(http: Http, keyword: string, languages: string[], skip: number, limit: number) {
  const response = await http.get<any, AxiosResponse<SearchSetsResponse>>(`${Apis.suggestSets}?keyword=${keyword}&languages=${languages.join(",")}&skip=${skip}&limit=${limit}`)

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
