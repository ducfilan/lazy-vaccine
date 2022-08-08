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
  messenger: {
    key: "messenger",
    title: "FB Messenger",
  },
}

export const CreateSetDescriptionMaxLength = 500

export const RecaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || ""
export const GoogleClientId = process.env.GOOGLE_CLIENT_ID || ""

export const LocalStorageKeyPrefix = "duc.lazy-vaccine."

export const LiteralDurationsExtractRegex = /^((?<days>\d+)d\w*?)* *((?<hours>\d+)h\w*)* *((?<minutes>\d+)m\w*)* *((?<seconds>\d+)s\w*)*$/

export const RequestToAddCategoryLink = "https://forms.gle/D6wa49fG4aUg3fHg8"
export const ContactFeedbackLink = "https://forms.gle/Czqrgp9xNDJ4rRg58"

export const ItemTypes = {
  TermDef: { label: "Term - Definition", value: "term-def" },
  QnA: { label: "Question - Answers", value: "q&a" },
  Content: { label: "Content", value: "content" },
}

// Item types to use when cannot get the learning item.
export const OtherItemTypes = {
  NotLoggedIn: { value: "not-logged-in" },
  NotSubscribed: { value: "not-subscribed" },
  NetworkTimeout: { value: "network-timeout" },
  NetworkOffline: { value: "network-offline" },
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

export const ApiBaseUrl = process.env.API_BASE_URL
export const StaticBaseUrl = process.env.STATIC_ASSET_URL
export const StaticApiBaseUrl = process.env.STATIC_API_BASE_URL

export const InjectTypes = {
  FixedPosition: 1,
  DynamicGenerated: 2
}

export const ChromeMessageTypeToken = "get-chrome-token"
export const ChromeMessageTypePlayAudio = "play-audio"
export const ChromeMessageTypeSignUp = "sign-up-first-time"
export const ChromeMessageClearRandomSetCache = "clear-random-set-cache"
export const ChromeMessageTypeGetRandomItem = "get-random-item"
export const ChromeMessageTypeGetRandomSet = "get-random-set"
export const ChromeMessageTypeInteractItem = "interact-item"
export const ChromeMessageTypeSetLocalSetting = "set-local-setting"
export const ChromeMessageTypeGetLocalSetting = "get-local-setting"

export const InteractionSubscribe = "subscribe"
export const InteractionLike = "like"
export const InteractionDislike = "dislike"
export const InteractionCreate = "create"

export const ColorPrimary = "#12b886"

export const ItemsInteractionShow = 'show'
export const ItemsInteractionNext = 'next'
export const ItemsInteractionPrev = 'prev'
export const ItemsInteractionIgnore = 'ignore'
export const ItemsInteractionForcedDone = 'forced-done'
export const ItemsInteractionAnswerCorrect = 'answer-correct'
export const ItemsInteractionAnswerIncorrect = 'answer-incorrect'
export const ItemsInteractionStar = 'star'
export const ItemsInteractionFlip = 'flip'

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

export const InjectWrapperClassName = ".lazy-vaccine"
