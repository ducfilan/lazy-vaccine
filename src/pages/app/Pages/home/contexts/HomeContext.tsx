import { createContext, useContext } from "react"
import { Category } from "@/common/types/types"

type Context = {
  categories?: Category[]
  setCategories: (categories: Category[]) => void
}

export const HomeContext = createContext<Context>({
  categories: undefined,
  setCategories: () => {},
})

export const useHomeContext = () => useContext(HomeContext)
