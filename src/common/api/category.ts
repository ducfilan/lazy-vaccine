import { AxiosResponse } from "axios";
import { Category, CategoryResponse } from "@/common/types/types";
import Apis from "@consts/apis";
import { Http } from "../facades/axiosFacade";

export async function getCategories(http: Http, langCode: string): Promise<Category[]> {
  const response = await http.get<any, AxiosResponse<CategoryResponse[]>>(Apis.categories(langCode))

  if (!response?.data) throw new Error("cannot get categories")

  const categories = response?.data
    .map(({ _id, name, description, path }: CategoryResponse) =>
      new CategoryResponse(_id, name, description, path)
    )
    .map((c: CategoryResponse) => c.toCategories(langCode))

  return _buildCategoriesTree(categories, langCode)
}

let _buildCategoriesTree = (rawCategories: Category[], locale: string): Category[] => {
  let rootCategories = rawCategories
    .filter(c => c.path === null)

  const rootCategoriesIds = rootCategories.map(c => c.value)

  rawCategories = _removeFilteredCategories(rawCategories, rootCategoriesIds)

  rootCategories.forEach((rootCategory: Category) => _buildSubCategories(rawCategories, rootCategory))

  return rootCategories
}

let _removeFilteredCategories = (categoriesBeforeRemove: Category[], categoriesToBeRemovedIds: string[]) =>
  categoriesBeforeRemove.filter(c => !categoriesToBeRemovedIds.includes(c.value))

let _buildSubCategories = (rawCategories: Category[], parentCategory: Category) => {
  if (rawCategories.length == 0) {
    return
  }

  parentCategory.children = rawCategories
    .filter(c => c.path == `${parentCategory.path || ','}${parentCategory.value},`)

  rawCategories = _removeFilteredCategories(rawCategories, parentCategory.children.map(c => c.value))
}
