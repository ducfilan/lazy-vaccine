import { AxiosResponse } from "axios"
import { Category, CategoryResponse } from "@/common/types/types"
import { ApiCategories } from "@consts/apis"
import { Http } from "@facades/axiosFacade"

export async function getCategories(http: Http, langCode: string): Promise<Category[]> {
  const response = await http.get<any, AxiosResponse<CategoryResponse[]>>(ApiCategories(langCode))

  if (!response?.data) throw new Error("cannot get categories")

  const categories = response?.data
    .map(({ _id, name, description, isTopCategory, path }: CategoryResponse) =>
      new CategoryResponse(_id, name, description, isTopCategory, path)
    )
    .map((c: CategoryResponse) => c.toCategories(langCode))

  return _buildCategoriesTree(categories, langCode)
}

let _buildCategoriesTree = (rawCategories: Category[], locale: string): Category[] => {
  _buildSubCategories(rawCategories)

  return rawCategories.filter(c => c.path === null)
}

let _buildSubCategories = (rawCategories: Category[], parentPath: string | null = null) => {
  const currentLevelCategories = rawCategories.filter(c => c.path === parentPath)

  if (currentLevelCategories.length == 0) {
    return
  }

  currentLevelCategories.forEach(currentCategory => {
    const nextLevelPath = `${parentPath || ','}${currentCategory.value},`

    const children = rawCategories.filter(child => child.path === nextLevelPath)
    currentCategory.children = children

    _buildSubCategories(rawCategories, nextLevelPath)
  })
}

export async function getTopCategories(http: Http, langCode: string): Promise<Category[]> {
  const response = await http.get<any, AxiosResponse<CategoryResponse[]>>(ApiCategories(langCode, true))

  if (!response?.data) throw new Error("cannot get categories")

  const categories = response?.data
    .map(({ _id, name, description, isTopCategory, path }: CategoryResponse) =>
      new CategoryResponse(_id, name, description, isTopCategory, path)
    )
    .map((c: CategoryResponse) => c.toCategories(langCode))

  return categories
}
