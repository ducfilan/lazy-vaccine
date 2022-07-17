import { InjectionTargetsResponse } from "@/common/types/types"
import Apis from "@consts/apis"
import { AxiosResponse } from "axios"
import { get } from "@facades/axiosFacade"

export async function getInjectionTargets(): Promise<InjectionTargetsResponse> {
  return (await get<any, AxiosResponse<InjectionTargetsResponse>>(Apis.getInjectionTargets)).data.sort((a, b) => a.Order - b.Order)
}
