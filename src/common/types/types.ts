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
  children?: Category[]
}

export class CategoryResponse {
  _id: string
  name: any
  description: any
  path?: string

  constructor(id: string, name: object, description: object, path?: string) {
    this._id = id
    this.name = name
    this.description = description
    this.path = path
  }

  toCategories(langCode: string) {
    return {
      key: this._id,
      title: this.name[langCode],
      value: this._id,
      path: this.path,
    } as Category
  }
}

export type TopSetsResponse = {
  topSets: SetInfo[]
  interactions: Interaction[] | null
}

export type SearchSetsResponse = {
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
}

export type SetInfoItem = {
  type: string,
  _id: string,
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
  tags: string[],
  classes: string[],
  id: string,
  attrs: string[][]
}

export type InjectionTarget = {
  selector: string,
  type: number,
  siblingSelector: string
}
