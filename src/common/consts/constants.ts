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
  },
  SetDetail: {
    key: "set-detail",
    name: "Set detail",
    path: "/set-detail/:setId",
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

export const LiteralDurationsExtractRegex = /^((?<days>\d+)d\w*?)* *((?<hours>\d+)h\w*)* *((?<minutes>\d+)m\w*)* *((?<seconds>\d+)s\w*)*$/

export const RequestToAddCategoryLink = "https://forms.gle/D6wa49fG4aUg3fHg8"

export const ItemTypes = {
  TermDef: { label: "Term - Definition", value: "term-def" },
  QnA: { label: "Question - Answers", value: "question-answers" },
  Content: { label: "Content", value: "content" },
}

export const TabKeyCode = "Tab"

export const RequiredRule = { required: true, message: chrome.i18n.getMessage("required_field") }

export const MaxLengthRule = (length: number) => (() => ({
  validator(_: any, value: any) {
    if (!value || value.length <= length) {
      return Promise.resolve();
    }

    return Promise.reject(new Error(`${chrome.i18n.getMessage("max_length_field")} ${length}`));
  },
}))

export const MaxTagsCountPerSet = 20

export const MaxLengthSetTitle = 60

export const DebounceTimeout = 500

export const MaxTryAgainSignInCount = 3

export const StaticBaseUrl = "https://static.lazyvaccine.com"