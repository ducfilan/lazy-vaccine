const Apis = {
  categories: (langCode: string) => `/categories?lang=${langCode}`,
  users: "/users",
  sets: "/sets",
  items: "/items",
  login: "/users/login",
  me: "/users/me",
}

export default Apis