import { StaticApiBaseUrl } from "@consts/constants"

const Apis = {
  categories: (langCode: string) => `/categories?lang=${langCode}`,
  getSetsInCategory: (categoryId: string, skip: number, limit: number) => `/categories/${categoryId}/sets?skip=${skip}&limit=${limit}`,
  topSetsInCategory: (langCode: string, categoryId: string) => `/categories/${categoryId}/top-sets?lang=${langCode}`,
  interaction: (setId: string, action: string) => `/interactions/${setId}/interactions?action=${action}`,
  itemInteraction: (setId: string, itemId: string, action: string) => `/items-interactions/${setId}/items-interactions/${itemId}/?action=${action}`,
  users: "/users",
  sets: "/sets",
  topSets: (langCode: string) => `/top-sets?lang=${langCode}`,
  items: "/items",
  login: "/users/login",
  me: "/users/me",
  preSignedUrl: "/images/pre-signed-url",
  getUserInteractionSets: (userId: string, interaction: string, skip: number, limit: number) => `${Apis.users}/${userId}/sets?interaction=${interaction}&skip=${skip}&limit=${limit}`,
  randomSet: (interaction: string) => `${Apis.me}/random-set?interaction=${interaction}`,
  itemsInteractions: (beginDate: string, endDate: string) => `items-statistics?beginDate=${beginDate}&endDate=${endDate}`,
  setsInteractions: () => `sets-statistics`,
  uploadTestResult: (setId: string) => `/interactions/${setId}/upload-result`,
  getMissions: "/missions",
  getInjectionTargets: `${StaticApiBaseUrl}/injection-targets.json`,
}

export default Apis
