import { Mission } from "@/common/types/types"
import { ApiGetMissions } from "@consts/apis"
import { AxiosResponse } from "axios"
import { Http } from "@facades/axiosFacade"

export async function getMissions(http: Http, ids: number[]): Promise<Mission[]> {
  return (await http.post<any, AxiosResponse<Mission[]>>(ApiGetMissions, { ids })).data
}
