import { get } from "@facades/axiosFacade"
import { NftInfo } from "@/common/types/types"
import { AxiosResponse } from "axios"

export async function getNftsInfo(uris: string[]): Promise<NftInfo[]> {
  return new Promise<NftInfo[]>((resolve, reject) => {
    let allNftsInfo: NftInfo[] = []
    uris.forEach(async uri => {
      try {
        const nftInfo = (await get<any, AxiosResponse<NftInfo>>(uri)).data
        allNftsInfo.push(nftInfo)
        if (allNftsInfo.length == uris.length) {
          return resolve(allNftsInfo)
        }
      } catch (error) {
        reject(error)
      }
    })
  })
}
