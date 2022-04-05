import { createContext, useContext } from "react"
import { Category } from "@/common/types/types"

type Context = {
  categories?: Category[]
  setCategories: (categories: Category[]) => void
}

export const SearchResultContext = createContext<Context>({
  categories: undefined,
  setCategories: () => {},
})

export const useSearchResultContext = () => useContext(SearchResultContext)
