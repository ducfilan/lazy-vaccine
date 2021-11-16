import { createContext, useContext } from "react"

export type Context = {
}

export const HomeContext = createContext<Context>({
})

export const useSetDetailContext = () => useContext(HomeContext)
