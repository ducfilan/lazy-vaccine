import { AxiosResponse } from "axios";
import { http } from "@facades/axiosFacade";
import { User } from "@/common/types/types";
import Apis from "@consts/apis";
import StatusCode from "@consts/statusCodes";

export async function getUserInfo(): Promise<User> {
  const { data: userInfo } = await http.get<any, AxiosResponse<User>>(Apis.me)

  return userInfo;
}

export async function updateUserInfo(data: Object): Promise<boolean> {
  const { status } = await http.patch<any, AxiosResponse<boolean>>(Apis.me, data)

  return status === StatusCode.Ok
}