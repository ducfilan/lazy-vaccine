import { RestrictedKeywordsResponse } from "@/common/types/types"
import Apis from "@consts/apis"
import { AxiosResponse } from "axios"
import { get } from "@facades/axiosFacade"

export async function getRestrictedKeywords(): Promise<string[]> {
  return (
    (await get<any, AxiosResponse<RestrictedKeywordsResponse>>(Apis.getRestrictedKeywords))?.data.restrictedKeywords ||
    []
  )
}
