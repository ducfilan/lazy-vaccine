import { AxiosResponse } from "axios";
import { User } from "@/common/types/types";
import Apis from "@consts/apis";
import StatusCode from "@consts/statusCodes";
import { Http } from "../facades/axiosFacade";

export async function getUserInfo(http: Http): Promise<User> {
  const { data: userInfo } = await http.get<any, AxiosResponse<User>>(Apis.me)

  return userInfo
}

export async function updateUserInfo(http: Http, data: Object): Promise<boolean> {
  const { status } = await http.patch<any, AxiosResponse<boolean>>(Apis.me, data)

  return status === StatusCode.Ok
}
