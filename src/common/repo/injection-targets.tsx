import { InjectionTargetsResponse } from "@/common/types/types"
import { ApiGetInjectionTargets } from "@consts/apis"
import { AxiosResponse } from "axios"
import { get } from "@facades/axiosFacade"

export async function getInjectionTargets(): Promise<InjectionTargetsResponse> {
  const targets = (await get<any, AxiosResponse<InjectionTargetsResponse>>(ApiGetInjectionTargets))?.data
  targets.sort((a, b) => a.Order - b.Order)

  return targets || []
}
