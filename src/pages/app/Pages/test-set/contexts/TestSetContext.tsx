import { createContext, useContext } from "react"

type Context = {
}

export const TestSetContext = createContext<Context>({
})

export const useTestSetContext = () => useContext(TestSetContext)