import { InjectionTargetsResponse, RestrictedKeywordsResponse, TopSearchKeywordsResponse } from "@/common/types/types"
import { ApiGetInjectionTargets, ApiGetRestrictedKeywords, ApiGetTopSearchKeywords } from "@consts/apis"
import { AxiosResponse } from "axios"
import { get } from "@facades/axiosFacade"

export async function getRestrictedKeywords(): Promise<string[]> {
  return (
    (await get<any, AxiosResponse<RestrictedKeywordsResponse>>(ApiGetRestrictedKeywords))?.data.restrictedKeywords || []
  )
}

export async function getTopSearchKeywords(): Promise<string[]> {
  return (
    (await get<any, AxiosResponse<TopSearchKeywordsResponse>>(ApiGetTopSearchKeywords))?.data.topSearchKeywords || []
  )
}

export async function getInjectionTargets(): Promise<InjectionTargetsResponse> {
  const targets = (await get<any, AxiosResponse<InjectionTargetsResponse>>(ApiGetInjectionTargets))?.data
  targets.sort((a, b) => a.Order - b.Order)

  return targets || []
}
