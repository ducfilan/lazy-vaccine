export const AppPages = {
  Home: {
    key: "side-home",
    name: "Home",
    path: "/home",
  },
  Sets: {
    key: "side-find-sets",
    name: "Find sets",
    path: "/sets",
  }
}

export const Inject = {
  Type: {
    FixedPosition: 1,
    DynamicGenerated: 2
  },
  Rate: {

  }
}

export const LoginTypes = {
  google: "google"
}

export const ApiTimeOut = 10000 // milliseconds

export const DefaultLangCode = "en"

export const SupportingPages: { [brandName: string]: { key: string, title: string } } = {
  facebook: {
    key: "facebook",
    title: "Facebook",
  },
  youtube: {
    key: "youtube",
    title: "Youtube",
  },
  amazon: {
    key: "amazon",
    title: "Amazon",
  },
  ebay: {
    key: "ebay",
    title: "Ebay",
  },
  twitter: {
    key: "twitter",
    title: "Twitter",
  },
  reddit: {
    key: "reddit",
    title: "Reddit",
  },
  google: {
    key: "google",
    title: "Google",
  },
  pinterest: {
    key: "pinterest",
    title: "Pinterest",
  },
}
