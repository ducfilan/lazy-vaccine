import { InjectionTarget } from "@/common/types/types"

export const AppBasePath = "pages/lazy-vaccine.html#"

export const AppPages = {
  Home: {
    key: "side-home",
    name: "Home",
    path: "/home",
    isSideNav: true,
  },
  Sets: {
    key: "side-find-sets",
    name: "Find sets",
    path: "/sets",
    isSideNav: false,
  },
  CreateSet: {
    key: "create-set",
    name: "Create set",
    path: "/create-set",
    isSideNav: false,
  },
  EditSet: {
    key: "edit-set",
    name: "Edit set",
    path: "/edit-set/:setId",
    isSideNav: false,
  },
  SetDetail: {
    key: "set-detail",
    name: "Set detail",
    path: "/set-detail/:setId",
    isSideNav: false,
  },
  UserProfile: {
    key: "user-profile",
    name: "User profile",
    path: "/user-profile/:userId",
    isSideNav: false,
  },
  MySpace: {
    key: "my-space",
    name: "My space",
    path: "/me",
    isSideNav: true,
  },
  CategorySets: {
    key: "category-sets",
    name: "Category Sets",
    path: "/category/:categoryId",
    isSideNav: false,
  },
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

export const MaxTagsCountPerSet = 20

export const MaxLengthSetTitle = 60

export const DebounceTimeout = 500

export const MaxTryAgainSignInCount = 3

export const StaticBaseUrl = "https://static.lazyvaccine.com"

export const InjectTypes = {
  FixedPosition: 1,
  DynamicGenerated: 2
}

export const ChromeMessageTypeToken = "get-chrome-token"
export const ChromeMessageClearRandomSetCache = "clear-random-set-cache"
export const ChromeMessageTypeGetRandomItem = "get-random-item"
export const ChromeMessageTypeGetRandomSet = "get-random-set"

export const InjectionTargets = {
  YoutubeHome: [
    {
      selector: "#contents",
      type: InjectTypes.DynamicGenerated,
      siblingSelector: ".style-scope.ytd-rich-grid-row"
    } as InjectionTarget
  ],
  YoutubeVideoView: [
    {
      selector: "#secondary.ytd-watch-flexy",
      type: InjectTypes.FixedPosition
    } as InjectionTarget
  ],
  FacebookHomePage: [
    {
      selector: "[role='feed']",
      type: InjectTypes.DynamicGenerated,
      siblingSelector: "[data-pagelet='FeedUnit_{n}']"
    } as InjectionTarget
  ],
}

export const RegexYoutubeHomePage = /^https:\/\/(www\.)*youtube\.com\/{0,1}$/
export const RegexYoutubeVideoView = /^https:\/\/(www\.)*youtube\.com\/watch\?v=.*$/
export const RegexYoutubeSearchResults = /^https:\/\/(www\.)*youtube\.com\/results\?search_query=(.*)$/
export const RegexFacebookHomePage = /^https:\/\/(www\.)*facebook\.com\/{0,1}$/

export const InteractionSubscribe = "subscribe"
export const InteractionLike = "like"
export const InteractionDislike = "dislike"
export const InteractionCreate = "create"

export const ColorPrimary = "#12b886"