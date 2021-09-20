import { Http } from "../facades/axiosFacade";
import { SetInfo } from "@/common/types/types";
import { AxiosResponse } from "axios";
import StatusCode from "@consts/statusCodes";
import Apis from "@consts/apis";
import { ParamError } from "@consts/errors";

export async function createSet(http?: Http, setInfo?: SetInfo) {
  if (!http || !setInfo) throw new ParamError();

  const { status } = await http.post<any, AxiosResponse<boolean>>(Apis.sets, setInfo)

  return status === StatusCode.Ok
}
