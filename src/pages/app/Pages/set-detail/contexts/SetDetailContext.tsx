import { SetInfo } from "@/common/types/types"
import { createContext, useContext } from "react"

export type Context = {
  setInfo?: SetInfo
}

export const SetDetailContext = createContext<Context>({
  setInfo: undefined,
})

export const useSetDetailContext = () => useContext(SetDetailContext)
