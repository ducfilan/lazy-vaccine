import { Http } from "../facades/axiosFacade";
import { SetInfo } from "@/common/types/types";
import { AxiosResponse } from "axios";
import Apis from "@consts/apis";
import { ParamError } from "@consts/errors";

export async function createSet(http?: Http, setInfo?: SetInfo): Promise<string> {
  if (!http || !setInfo) throw new ParamError();

  const { data: insertedSetId } = await http.post<any, AxiosResponse<string>>(Apis.sets, setInfo)

  return insertedSetId
}

export async function getSetInfo(http: Http, setId: string): Promise<SetInfo> {
  if (!http || !setId) throw new ParamError();

  const response = await http.get<any, AxiosResponse<SetInfo>>(`${Apis.sets}/${setId}`);

  const setInfo = response?.data
  if (!setInfo) throw new Error("cannot get set info")

  return setInfo
}
