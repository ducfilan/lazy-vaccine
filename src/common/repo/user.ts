import { AxiosResponse } from "axios"
import { User } from "@/common/types/types"
import Apis from "@consts/apis"
import StatusCode from "@consts/statusCodes"
import { Http } from "../facades/axiosFacade"

export async function getUserInfo(http: Http): Promise<User> {
  const response = await http.get<any, AxiosResponse<User>>(Apis.me)

  const userInfo = response?.data
  if (!userInfo) throw new Error("cannot get user info")

  return userInfo
}

export async function updateUserInfo(http: Http, data: Object): Promise<boolean> {
  const { status } = await http.patch<any, AxiosResponse<boolean>>(Apis.me, data)

  return status === StatusCode.Ok
}
