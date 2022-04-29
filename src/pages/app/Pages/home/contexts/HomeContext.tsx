import { createContext, useContext } from "react"
import { Category } from "@/common/types/types"

type Context = {
  categories?: Category[]
  selectedCategoryId: string
  setCategories: (categories: Category[]) => void
  onCategoryChanged: (categoryId: string) => void
}

export const HomeContext = createContext<Context>({
  categories: undefined,
  selectedCategoryId: "",
  setCategories: () => {},
  onCategoryChanged: () => {}
})

export const useHomeContext = () => useContext(HomeContext)
