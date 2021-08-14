import { AxiosResponse } from "axios";
import { http } from "@facades/axiosFacade";
import { User } from "@/common/types/types";
import Apis from "@consts/apis";

export async function getUserInfo(): Promise<User> {
  const { data: userInfo } = await http.get<any, AxiosResponse<User>>(Apis.me)

  return userInfo;
}
