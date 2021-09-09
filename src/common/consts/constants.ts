export const AppPages = {
  Home: {
    key: "side-home",
    name: "Home",
    path: "/",
    isSideNav: true,
  },
  Sets: {
    key: "side-find-sets",
    name: "Find sets",
    path: "/sets",
    isSideNav: true,
  },
  CreateSet: {
    key: "create-set",
    name: "Create set",
    path: "/create-set",
    isSideNav: false,
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

export const CreateSetDescriptionMaxLength = 250

export const RecaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || ""

export const LocalStorageKeyPrefix = "duc.lazy-vaccine."

export const LiteralDurationsExtractRegex = /^((?<days>\d+)d\w*?)* *((?<hours>\d+)h\w*)* *((?<minutes>\d+)m\w*)* *((?<seconds>\d+)s\w*)*$/gm

export const RequestToAddCategoryLink = "https://forms.gle/D6wa49fG4aUg3fHg8"