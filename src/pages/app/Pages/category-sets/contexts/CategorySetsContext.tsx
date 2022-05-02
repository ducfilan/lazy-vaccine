import { createContext, useContext } from "react"

type Context = {
    selectedCategoryId: string,
    onChangeCategoryId: (categoryId: string) => void
}

export const CategorySetsContext = createContext<Context>({
    selectedCategoryId: "",
    onChangeCategoryId: () => {}
})

export const useCategorySetsContext = () => useContext(CategorySetsContext)