import SupportingLanguages from "@consts/supportingLanguages"

export type KeyValuePair = {
  key: string
  value: string
}

export type Language = {
  name: string
  code: string
}

export type GoogleUserInfo = {
  email: string
  email_verified: boolean
  family_name: string
  given_name: string
  locale: string
  name: string
  picture: string
}

export type User = {
  _id: string
  name: string
  email: string
  locale: string
  pictureUrl: string
  finishedRegisterStep: number
  langCodes?: string[]
  pages?: string[]
}

export type Category = {
  key: string
  title: string
  value: string
  path?: string
  isTopCategory: boolean
  children?: Category[]
}

export type SetsInCategoryResponse = {
  total: number
  sets: SetInfo[]
}

export class CategoryResponse {
  _id: string
  name: any
  description: any
  path?: string
  isTopCategory: boolean

  constructor(id: string, name: object, description: object, isTopCategory: boolean, path?: string) {
    this._id = id
    this.name = name
    this.description = description
    this.isTopCategory = isTopCategory
    this.path = path
  }

  toCategories(langCode: string) {
    return {
      key: this._id,
      title: this.name[langCode],
      value: this._id,
      path: this.path,
      isTopCategory: this.isTopCategory,
    } as Category
  }
}

export type TopSetsResponse = {
  topSets: SetInfo[]
  interactions: Interaction[] | null
}

export type SearchSetsResponse = {
  total: number
  sets: SetInfo[]
  interactions: Interaction[] | null
}

export type Interaction = {
  setId: string
  actions: string[]
}

export type PreSignedUrlResponse = {
  url: string
}

export type UserInteractionSetsResponse = {
  total: number,
  sets: {
    actions: string[],
    set: SetInfo
  }[]
}

export type UserInteractionSetResponse = {
  actions: string[]
  set: SetInfo
}

export type LanguageCode = keyof typeof SupportingLanguages.Set

export type SetInfo = {
  _id: string
  name: string
  categoryId: string
  categoryName?: string
  creatorImageUrl?: string
  categoryNameEn?: string
  creatorId?: string
  creatorName?: string
  description?: string
  tags?: string[]
  items?: SetInfoItem[]
  fromLanguage: LanguageCode
  toLanguage?: LanguageCode
  captchaToken?: string | null
  imgUrl?: string
  lastUpdated?: string,

  isSubscribed?: boolean
  isLiked?: boolean
  isDisliked?: boolean
  interactionCount?: {
    [key: string]: number
  },
  actions?: string[],
  total?: number,
  itemsInteractions?: {
    itemId: string,
    interactionCount: {
      [key: string]: number
    }
  }[],
}

export type SetInfoItem = {
  type: string,
  _id: string,
  answers?: {
    isCorrect?: boolean,
    answer: string
    [key: string]: any
  }[],
  [key: string]: any
}

export type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : { [key: string]: Event }

export type UploadImageResponse = {
  uploadedImgUrl: string
}

export type PageInjectorSiblingSelectorParts = {
  tag: string,
  classes: string[],
  id: string,
  attrs: string[][]
}

export type InjectionTarget = {
  rate: number,
  selector: string,
  type: number,
  newGeneratedElementSelector: string,
  siblingSelector: string,
  strict: boolean,
}

export type SeedInfo = {
  _id: string
  name: string
  imgUrl?: string
  categoryNames: string[]
  price: number
}

export type UserStatisticsResponse = {
  userId: string,
  _id: string,
  date: string,
  interactions: {
    [key: string]: number
  }
}

export type SetStatisticsResponse = {
  _id: string,
  subscribedSetsCount: number,
  totalItemsCount: number,
  learntItemsCount: number,
}

export type TestResult = {
  result: {
    total: number,
    score: number
  }
}

export type NftInfo = {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  attributes: Attribute[];
  external_url: string;
  properties: Properties;
  collection: null;
  use: null;
}

export type Attribute = {
  trait_type: string;
  value: number | string;
}

export type Properties = {
  files: File[];
  category: string;
  creators: Creator[];
}

export type Creator = {
  address: string;
  share: number;
}

export type File = {
  uri: string;
  type: string;
}

export type Mission = {
  _id: string,
  missionId: number,
  missionDetail: string
}
