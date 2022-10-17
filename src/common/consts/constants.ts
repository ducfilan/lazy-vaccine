export const AppBasePath = "pages/lazy-vaccine.html#"

export const AppPageCreateSet = {
  key: "create-set",
  name: "Create set",
  path: "/create-set",
  isSideNav: false,
}

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
  CreateSet: AppPageCreateSet,
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
  TestSet: {
    key: "test-set",
    name: "Test set",
    path: "/test-set/:setId",
    isSideNav: false,
  },
  GettingStarted: {
    key: "getting-started",
    name: "Getting started",
    path: "/getting-started",
    isSideNav: false,
  },
}

export const LoginTypes = {
  google: "google"
}

export const ApiTimeOut = 30000 // milliseconds

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

export const IntMax = 2147483647

export const CreateSetDescriptionMaxLength = 500

export const RecaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || ""
export const GoogleClientId = process.env.GOOGLE_CLIENT_ID || ""
export const HeapIoId = process.env.HEAP_IO_ID || ""

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
  SuggestionSets: { value: "suggestion-sets" },
  ReviewStaredItems: { value: "review-stared-items" },
}

export const TabKeyCode = "Tab"

export const MaxTagsCountPerSet = 20
export const MaxLengthSetTitle = 60
export const DebounceTimeout = 500
export const MaxTryAgainSignInCount = 3
export const TestQuestionAmount = 20
export const TrueFalseQuestionAmount = 10
export const ItemsLimitPerGet = 50
export const StarItemsLimitPerGet = 20
export const MaximumItemShow = 5

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
export const ChromeMessageTypeGetRandomSetSilent = "get-random-set-silent"
export const ChromeMessageTypeGetSetSilent = "get-set-silent"
export const ChromeMessageTypeInteractItem = "interact-item"
export const ChromeMessageTypeInteractSet = "interact-set"
export const ChromeMessageTypeUndoInteractSet = "undo-interact-set"
export const ChromeMessageTypeSetLocalSetting = "set-local-setting"
export const ChromeMessageTypeGetLocalSetting = "get-local-setting"
export const ChromeMessageTypeIdentifyUser = "identify-user"
export const ChromeMessageTypeTracking = "tracking"
export const ChromeMessageTypeSuggestSets = "suggest-sets"
export const ChromeMessageTypeCountInteractedItems = "count-interacted-items"
export const ChromeMessageTypeGetInteractedItems = "get-interacted-items"
export const ChromeMessageTypeGetInjectionTargets = "get-injection-targets"
export const ChromeMessageTypeGetRestrictedKeywords = "get-restricted-keywords"

export const InteractionSubscribe = "subscribe"
export const InteractionLike = "like"
export const InteractionDislike = "dislike"
export const InteractionCreate = "create"

export const ColorPrimary = "#12b886"
export const ColorWhite = "#fff"

export const ItemsInteractionShow = 'show'
export const ItemsInteractionNext = 'next'
export const ItemsInteractionPrev = 'prev'
export const ItemsInteractionIgnore = 'ignore'
export const ItemsInteractionForcedDone = 'forced-done'
export const ItemsInteractionAnswerCorrect = 'answer-correct'
export const ItemsInteractionAnswerIncorrect = 'answer-incorrect'
export const ItemsInteractionStar = 'star'
export const ItemsInteractionFlip = 'flip'
export const ItemsInteractionReviewStar = "review-star"

export const ItemsInteractionCopyText = "copy-card-text"

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

export const UserProfileTabMyAchievements = "myAchievement"
export const UserProfileTabSubscribed = "subscribed"
export const UserProfileTabLiked = "liked"
export const UserProfileTabCreated = "created"
export const UserProfileTabSettingPages = "settingPages"

export const DefaultImage = "data:image/png;base64,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"

export const SetTypeNormal = 1
export const SetTypeReviewStarredItems = 2