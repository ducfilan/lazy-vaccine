import { ApiBaseUrl, StaticApiBaseUrl } from "@consts/constants"

export const ApiCategories = (langCode: string) => `/categories?lang=${langCode}`
export const ApiGetSetsInCategory = (categoryId: string, skip: number, limit: number) => `/categories/${categoryId}/sets?skip=${skip}&limit=${limit}`
export const ApiTopSetsInCategory = (langCode: string, categoryId: string) => `/categories/${categoryId}/top-sets?lang=${langCode}`
export const ApiInteraction = (setId: string, action: string) => `/interactions/${setId}/interactions?action=${action}`
export const ApiItemInteraction = (setId: string, itemId: string, action: string) => `/items-interactions/${setId}/items-interactions/${itemId}/?action=${action}`
export const ApiUsers = "/users"
export const ApiSets = "/sets"
export const ApiSuggestSets = "/users/me/suggestions"
export const ApiTopSets = (langCode: string) => `/top-sets?lang=${langCode}`
export const ApiItems = "/items"
export const ApiLogin = "/users/login"
export const ApiLogout = "/users/logout"
export const ApiMe = "/users/me"
export const ApiPreSignedUrl = "/images/pre-signed-url"
export const ApiGetUserInteractionSets = (userId: string, interaction: string, skip: number, limit: number) => `${ApiUsers}/${userId}/sets?interaction=${interaction}&skip=${skip}&limit=${limit}`
export const ApiRandomSet = (interaction: string, itemsSkip: number, itemsLimit: number) => `${ApiMe}/random-set?interaction=${interaction}&itemsSkip=${itemsSkip}&itemsLimit=${itemsLimit}`
export const ApiItemsInteractions = (beginDate: string, endDate: string) => `/items-statistics?beginDate=${beginDate}&endDate=${endDate}`
export const ApiCountInteractedItems = (interactionInclude: string, interactionIgnore: string) => `/items-interactions/count?interactionInclude=${interactionInclude}&interactionIgnore=${interactionIgnore}`
export const ApiGetInteractedItems = (interactionInclude: string, interactionIgnore: string, skip: number = 0, limit: number = 10) => `/items-interactions/items?interactionInclude=${interactionInclude}&interactionIgnore=${interactionIgnore}&skip=${skip}&limit=${limit}`
export const ApiGeneralInfoCounts = "sets-statistics"
export const ApiUploadTestResult = (setId: string) => `/interactions/${setId}/upload-result`
export const ApiGetMissions = "/missions"
export const ApiGetInjectionTargets = `${StaticApiBaseUrl}/injection-targets.json`
export const ApiGetRestrictedKeywords = `${StaticApiBaseUrl}/restricted-keywords.json`
export const ApiGetTokenFromCode = (code: string) => `${ApiBaseUrl}/token?code=${code}`
export const ApiRefreshAccessToken = (refreshToken: string) => `${ApiBaseUrl}/token/refresh?refreshToken=${refreshToken}`
export const ApiPronounceText = (text: string, langCode: string) => `${ApiBaseUrl}/audio/pronounce?text=${text}&langCode=${langCode}`
