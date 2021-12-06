import { createContext, useContext } from "react"
import { User } from "@/common/types/types"
import { Http } from "@facades/axiosFacade"

type Context = {
  user: User | null
  setUser: (user: User | null) => void
  http?: Http
}

export const GlobalContext = createContext<Context>({
  user: null,
  setUser: () => {},
  http: undefined,
})

export const useGlobalContext = () => useContext(GlobalContext)
