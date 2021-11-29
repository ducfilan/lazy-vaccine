const Apis = {
  categories: (langCode: string) => `/categories?lang=${langCode}`,
  users: "/users",
  sets: "/sets",
  topSets: (langCode: string) => `/top-sets?lang=${langCode}`,
  items: "/items",
  login: "/users/login",
  me: "/users/me",
}

export default Apis
