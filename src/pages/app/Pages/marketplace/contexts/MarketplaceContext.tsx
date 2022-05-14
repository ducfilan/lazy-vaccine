import { createContext, useContext } from "react"

type Context = {
}

export const MarketPlaceContext = createContext<Context>({
})

export const useMarketPlaceContext = () => useContext(MarketPlaceContext)