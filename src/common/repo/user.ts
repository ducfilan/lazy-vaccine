import { AxiosResponse } from "axios"
import { SetInfo, User, UserInteractionSetsResponse } from "@/common/types/types"
import Apis from "@consts/apis"
import StatusCode from "@consts/statusCodes"
import { Http } from "../facades/axiosFacade"
import { InteractionSubscribe, InteractionLike } from "../consts/constants"

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

// TODO: Add pagination limit.
export async function getUserInteractionSets(http: Http, userId: string, interaction: string): Promise<SetInfo[]> {
  const response = await http.get<any, AxiosResponse<UserInteractionSetsResponse[]>>(`${Apis.users}/${userId}/sets?interaction=${interaction}`)

  const sets = response?.data
  if (!sets) throw new Error("cannot get user interaction sets")

  return sets.map(({ actions, set }) => {
    set.isSubscribed = actions?.includes(InteractionSubscribe)
    set.isLiked = actions?.includes(InteractionLike)

    return set
  })
}

export async function updateUserInfo(http: Http, data: Object): Promise<boolean> {
  const { status } = await http.patch<any, AxiosResponse<boolean>>(Apis.me, data)

  return status === StatusCode.Ok
}
