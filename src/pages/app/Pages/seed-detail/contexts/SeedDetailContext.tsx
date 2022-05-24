import { createContext, useContext } from "react"

type Context = {
}

export const SeedDetailContext = createContext<Context>({
})

export const useSeedDetailContext = () => useContext(SeedDetailContext)