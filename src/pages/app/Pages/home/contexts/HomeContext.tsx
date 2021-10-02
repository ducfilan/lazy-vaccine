import { SetInfo } from "@/common/types/types"
import { createContext, useContext } from "react"

export type Context = {
  setInfo?: SetInfo
}

export const HomeContext = createContext<Context>({
  setInfo: undefined,
})

export const useSetDetailContext = () => useContext(HomeContext)
