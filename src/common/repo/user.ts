import { AxiosResponse } from "axios"
import { SetInfo, SetStatisticsResponse, User, UserInteractionSetResponse, UserInteractionSetsResponse, UserStatisticsResponse } from "@/common/types/types"
import Apis from "@consts/apis"
import StatusCode from "@consts/statusCodes"
import { Http } from "../facades/axiosFacade"
import { InteractionSubscribe, InteractionLike, InteractionDislike } from "../consts/constants"

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

  const sets = response?.data
  if (!sets) throw new Error("cannot get user interaction sets")

  sets.sets.forEach(({ set, actions }) => {
    set.isSubscribed = actions?.includes(InteractionSubscribe)
    set.isLiked = actions?.includes(InteractionLike)
    set.isDisliked = actions?.includes(InteractionDislike)

    return set
  })

  return sets
}

export async function getUserInteractionRandomSet(http: Http, interaction: string): Promise<SetInfo> {
  const response = await http.get<any, AxiosResponse<UserInteractionSetResponse>>(Apis.randomSet(interaction))

  const { actions, set } = response?.data
  if (!set) throw new Error("cannot get user interaction sets")

  set.isSubscribed = actions?.includes(InteractionSubscribe)
  set.isLiked = actions?.includes(InteractionLike)
  set.isDisliked = actions?.includes(InteractionDislike)

  return set
}

export async function updateUserInfo(http: Http, data: Object): Promise<boolean> {
  const { status } = await http.patch<any, AxiosResponse<boolean>>(Apis.me, data)

  return status === StatusCode.Ok
}

export async function getUserStatistics(http: Http, beginDate: string, endDate: string): Promise<UserStatisticsResponse[]> {
  const response = await http.get<any, AxiosResponse<UserStatisticsResponse[]>>(Apis.itemsInteractions(beginDate, endDate));

  const statistics = response?.data
  if (!statistics) throw new Error("cannot get user statistics")

  return statistics
}

export async function getSetsStatistics(http: Http): Promise<SetStatisticsResponse> {
  const response = await http.get<any, AxiosResponse<SetStatisticsResponse>>('sets-statistics');

  const setsStatistics = response?.data
  if (!setsStatistics) throw new Error("cannot get user statistics")

  return setsStatistics
}
