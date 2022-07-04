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
  MarketPlace: {
    key: "my-garden",
    name: "My Garden",
    path: "/my-garden",
    isSideNav: true,
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
  SeedDetail: {
    key: "seed-detail",
    name: "Seed detail",
    path: "/seed-detail/:seedId",
    isSideNav: false,
  },
  TestSet: {
    key: "test-set",
    name: "Test set",
    path: "/test-set/:setId",
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
  QnA: { label: "Question - Answers", value: "q&a" },
  Content: { label: "Content", value: "content" },
}

export const TabKeyCode = "Tab"

export const MaxTagsCountPerSet = 20

export const MaxLengthSetTitle = 60

export const DebounceTimeout = 500

export const MaxTryAgainSignInCount = 3

export const TestQuestionAmount = 20

export const TrueFalseQuestionAmount = 10

export const TestResultLevel = {
  High: 0.9,
  Medium: 0.7,
}

export const StaticBaseUrl = "https://static.lazyvaccine.com"

export const InjectTypes = {
  FixedPosition: 1,
  DynamicGenerated: 2
}

export const ChromeMessageTypeToken = "get-chrome-token"
export const ChromeMessageClearRandomSetCache = "clear-random-set-cache"
export const ChromeMessageTypeGetRandomItem = "get-random-item"
export const ChromeMessageTypeGetRandomSet = "get-random-set"
export const ChromeMessageTypeInteractItem = "interact-item"
export const ChromeMessageTypeSetLocalSetting = "set-local-setting"
export const ChromeMessageTypeGetLocalSetting = "get-local-setting"

export const InjectionTargets = {
  YoutubeHome: [
    {
      rate: 1,
      selector: "#primary",
      type: InjectTypes.FixedPosition
    } as InjectionTarget,
    {
      rate: 0.1,
      selector: "#contents",
      type: InjectTypes.DynamicGenerated,
      siblingSelector: ".style-scope.ytd-rich-grid-row"
    } as InjectionTarget
  ],
  YoutubeVideoView: [
    {
      rate: 1,
      selector: "#secondary.ytd-watch-flexy",
      type: InjectTypes.FixedPosition
    } as InjectionTarget
  ],
  FacebookHomePage: [
    {
      rate: 0.2,
      selector: "[role='feed']",
      type: InjectTypes.DynamicGenerated,
      newGeneratedElementSelector: "div",
      siblingSelector: "div:first-child",
      strict: true,
    } as InjectionTarget,
    {
      rate: 1,
      selector: "[role=complementary]",
      type: InjectTypes.FixedPosition
    } as InjectionTarget
  ],
  FacebookWatch: [
    {
      rate: 1,
      selector: ".hybvsw6c.cjfnh4rs",
      type: InjectTypes.FixedPosition
    } as InjectionTarget
  ],
  FacebookGaming: [
    {
      rate: 1,
      selector: ".hybvsw6c.cjfnh4rs",
      type: InjectTypes.FixedPosition
    } as InjectionTarget
  ],
  GoogleHomePage: [
    {
      rate: 1,
      selector: ".o3j99.qarstb",
      type: InjectTypes.FixedPosition,
    } as InjectionTarget
  ],
  TwitterHomePage: [
    {
      rate: 0.1,
      selector: "[data-testid=primaryColumn]",
      type: InjectTypes.DynamicGenerated,
      newGeneratedElementSelector: "[data-testId=cellInnerDiv]",
      siblingSelector: "div:first-child",
    } as InjectionTarget,
    {
      rate: 1,
      selector: ".r-1yadl64.r-1ifxtd0.r-1udh08x",
      type: InjectTypes.FixedPosition,
    } as InjectionTarget
  ],
  TwitterPostPage: [
    {
      rate: 0.1,
      selector: "[data-testid=primaryColumn]",
      type: InjectTypes.DynamicGenerated,
      newGeneratedElementSelector: "[data-testId=cellInnerDiv]",
      siblingSelector: "div:first-child",
    } as InjectionTarget,
    {
      rate: 1,
      selector: ".r-1yadl64.r-1ifxtd0.r-1udh08x",
      type: InjectTypes.FixedPosition,
    } as InjectionTarget
  ],
  RedditHomePage: [
    {
      rate: 0.1,
      selector: ".rpBJOHq2PR60pnwJlUyP0",
      type: InjectTypes.DynamicGenerated,
      newGeneratedElementSelector: "div",
      siblingSelector: ".scrollerItem",
      strict: true,
    } as InjectionTarget,
    {
      rate: 1,
      selector: "._1vYrJH5uc57mZQJPN4l34E",
      type: InjectTypes.FixedPosition,
    } as InjectionTarget,
    {
      rate: 1,
      selector: "#TrendingPostsContainer",
      type: InjectTypes.FixedPosition,
    } as InjectionTarget
  ],
  RedditCommentPage: [
    {
      rate: 1,
      selector: "#overlayScrollContainer ._1vYrJH5uc57mZQJPN4l34E",
      type: InjectTypes.FixedPosition,
    } as InjectionTarget
  ],
}

export const RegexYoutubeHomePage = /^https:\/\/(www\.)*youtube\.com\/{0,1}.*$/
export const RegexYoutubeVideoView = /^https:\/\/(www\.)*youtube\.com\/watch\?v=.*$/
export const RegexYoutubeSearchResults = /^https:\/\/(www\.)*youtube\.com\/results\?search_query=(.*)$/
export const RegexFacebookHomePage = /^https:\/\/(www\.)*facebook\.com\/{0,1}.*$/
export const RegexFacebookWatch = /^https:\/\/(www\.)*facebook\.com\/watch{0,1}.*$/
export const RegexFacebookGaming = /^https:\/\/(www\.)*facebook\.com\/gaming{0,1}.*$/
export const RegexGoogleHomePage = /^https:\/\/(www\.)*google\.com*(\.\w*)*\/{0,1}.*$/
export const RegexTwitterHomePage = /^https:\/\/(www\.)*twitter\.com\/home\/{0,1}.*$/
export const RegexTwitterPostPage = /^https:\/\/(www\.)*twitter\.com\/.*?\/status\/\d+.*$/
export const RegexRedditCommentPage = /^https:\/\/(www\.)*reddit\.com\/r\/.*?\/comments\/.*$/
export const RegexRedditHomePage = /^https:\/\/(www\.)*reddit\.com\/{0,1}.*$/

export const InteractionSubscribe = "subscribe"
export const InteractionLike = "like"
export const InteractionDislike = "dislike"
export const InteractionCreate = "create"

export const ColorPrimary = "#12b886"

export const ItemsInteractionShow = 'show'
export const ItemsInteractionNext = 'next'
export const ItemsInteractionIgnore = 'ignore'
export const ItemsInteractionForcedDone = 'forced-done'
export const ItemsInteractionAnswerCorrect = 'answer-correct'
export const ItemsInteractionAnswerIncorrect = 'answer-incorrect'
export const ItemsInteractionStar = 'star'

export const AchievementChartOrderIndex = {
  LearntItems: 0,
  IncorrectItems: 1,
  StaredItems: 2
}

export const i18n = chrome.i18n.getMessage

export const MarketplaceUrl = "http://localhost:3000/#/"

export const SettingKeyFrontItem = "front-item"
export const SettingKeyBackItem = "back-item"

export const FlashCardOptions: { [key: string]: string } = {
  "term": i18n("common_term"),
  "definition": i18n("common_definition"),
}
