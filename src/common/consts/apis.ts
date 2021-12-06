const Apis = {
  categories: (langCode: string) => `/categories?lang=${langCode}`,
  topSetsInCategory: (langCode: string, categoryId: string) => `/categories/${categoryId}/top-sets?lang=${langCode}`,
  users: "/users",
  sets: "/sets",
  topSets: (langCode: string) => `/top-sets?lang=${langCode}`,
  items: "/items",
  login: "/users/login",
  me: "/users/me",
}

export default Apis
