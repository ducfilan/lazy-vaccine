import { AxiosRequestConfig, AxiosResponse } from "axios"
import Apis from "@consts/apis"
import { ParamError } from "@consts/errors"
import StatusCode from "@consts/statusCodes"
import { Http, put } from "@facades/axiosFacade"
import { PreSignedUrlResponse } from "@/common/types/types"

export async function getPreSignedUploadUrl(http: Http, fileName: string, contentType: string): Promise<string> {
  if (!http || !fileName) throw new ParamError()

  const { data } = await http.post<any, AxiosResponse<PreSignedUrlResponse>>(Apis.preSignedUrl, { fileName, contentType })

  return data.url
}

export async function uploadImage(action: string, file: any, headers: AxiosRequestConfig): Promise<boolean> {
  const response = await put(action, file, headers)

  return response.status == StatusCode.Ok
}
