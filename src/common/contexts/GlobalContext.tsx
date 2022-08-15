import { createContext, useContext } from "react"
import { User } from "@/common/types/types"
import { Http } from "@facades/axiosFacade"

type Context = {
  user: User | null | undefined
  setUser: (user: User | null | undefined) => void
  http?: Http | null | undefined
  setHttp: (http: Http | null | undefined) => void
}

export const GlobalContext = createContext<Context>({
  user: null,
  setUser: () => {},
  http: null,
  setHttp: () => {},
})

export const useGlobalContext = () => useContext(GlobalContext)
