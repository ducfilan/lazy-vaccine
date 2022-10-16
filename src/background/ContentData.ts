import CacheKeys from "@/common/consts/cacheKeys"
import { ItemsLimitPerGet, ItemsInteractionStar, ItemsInteractionShow, ItemsInteractionForcedDone, ItemsInteractionIgnore, SetTypeNormal, SetTypeReviewStarredItems, StarItemsLimitPerGet, i18n } from "@/common/consts/constants"
import { TrackingNameSuggestFromNoInteraction, TrackingNameSuggestToSubscribeRandomly } from "@/common/consts/trackingNames"
import { User, SetInfo, SetInfoItem, ContentPageStatistics, KeyValuePair } from "@/common/types/types"
import { shuffleArray, generateNumbersArray } from "@/common/utils/arrayUtils"
import { appearInPercent, getStorageSyncData } from "@/common/utils/utils"
import { sendClearCachedRandomSetMessage, sendCountInteractedItemsMessage, sendGetRandomSubscribedSetSilentMessage, sendGetSetSilentMessage, sendGetStarredItemsMessage, sendInteractItemMessage, sendTrackingMessage } from "@/pages/content-script/messageSenders"
import { generateTemplateExtraValues, getNetworkErrorTemplateValues, getNotLoggedInTemplateValues, getNotSubscribedTemplateValues, getRecommendationTemplateValues, getSuggestReviewTemplateValues, toTemplateValues } from "@/pages/content-script/templateHelpers"

export class ContentData {
  public identity: User | null = null
  public setInfo: SetInfo | null = null
  public currentItemPointer: number = 0
  public randomItemIndexVisitMap: number[] = []
  public itemsInPageInteractionMap: {
    [itemId: string]: string[]
  } = {}
  public statistics: ContentPageStatistics = {}

  public isLoggedIn: boolean = false
  public havingSubscribedSets: boolean = false
  public isNeedRecommendation: boolean = false
  public isNeedReviewStaredItems: boolean = false
  public lastError: any = null

  public get setId(): string | null {
    return this.setInfo?._id || null
  }


  public get isDisplayedAllItemsInSet(): boolean {
    return this.currentItemPointer + 1 >= (this.setInfo?.totalItemsCount || 0)
  }


  public getIdentity() {
    return this.identity
  }

  public setIdentity(identity: User) {
    this.identity = identity
  }

  public async resetState() {
    // Remove cache from background page (app's scope).
    await sendClearCachedRandomSetMessage()

    this.currentItemPointer = 0
    this.setInfo = null
    this.randomItemIndexVisitMap = []
    this.itemsInPageInteractionMap = {}
    this.havingSubscribedSets = false
    this.lastError = null
  }

  public async initValues() {
    try {
      await this.resetState()

      await this.determineStatisticsValues()

      if (this.determineIsNeedReviewStaredItems()) {
        this.isLoggedIn = true
        this.havingSubscribedSets = true

        const setInfo = await this.buildStarredItemsSetInfo()
        this.setSetInfo(setInfo)
      } else {
        const setInfo = await sendGetRandomSubscribedSetSilentMessage(0, ItemsLimitPerGet)
        setInfo && this.setSetInfo(setInfo)
      }

      if (this.setInfo) {
        this.isLoggedIn = true
        this.havingSubscribedSets = true

        await this.determineIsNeedRecommendation()
      }
    } catch (error: any) {
      if (error?.error?.type === "NotSubscribedError") {
        console.debug("NotSubscribedError")
        this.havingSubscribedSets = false
        this.isLoggedIn = true
      } else if (error?.error?.type === "NotLoggedInError") {
        console.debug("NotLoggedInError")
        this.havingSubscribedSets = false
        this.isLoggedIn = false
      } else {
        this.lastError = error
        console.error(error)
      }
    }
  }

  public setSetInfo(setInfo: SetInfo) {
    this.setInfo = setInfo

    this.randomItemIndexVisitMap = shuffleArray(Array.from(Array(setInfo.items?.length || 0).keys()))

    this.setInfo.itemsInteractions?.map((itemInteractions) => {
      const isStarred = (itemInteractions.interactionCount.star || 0) % 2 == 1
      if (!isStarred) {
        delete itemInteractions.interactionCount.star
      }

      this.itemsInPageInteractionMap[itemInteractions.itemId] = Object.keys(itemInteractions.interactionCount)
    })
  }

  public appendSetItems(items: SetInfoItem[]) {
    if (!this.setInfo) return

    const newRandomItemsIndexMap = shuffleArray(generateNumbersArray(ItemsLimitPerGet, items.length))

    this.randomItemIndexVisitMap.push(...newRandomItemsIndexMap)
    this.setInfo.items.push(...items)
  }

  public interactItem(itemId: string, interaction: string) {
    this.itemsInPageInteractionMap[itemId] = [...(this.itemsInPageInteractionMap[itemId] || []), interaction]
  }

  /**
   * Get item at pointer, skip hidden items.
   * @param pointerPosition position to point to the set items.
   * @param skipStep Step to skip when a hidden item is met.
   * @param pointerChangeCallback callback to change pointer.
   * @returns item
   */
  public async getItemAtPointer(
    pointerPosition: number,
    skipStep: number = 1,
    pointerChangeCallback: Function = (skipStep: number = 1) => {
      this.currentItemPointer += skipStep
    }
  ): Promise<SetInfoItem | null> {
    if (!this.setInfo) return null

    const isOutOfBound = pointerPosition >= (this.setInfo.totalItemsCount || 0) || pointerPosition < 0
    if (isOutOfBound) return null

    if (pointerPosition >= (this.setInfo.items?.length || 0)) {
      await this.appendNextItemsToCurrentSet()
    }

    let rawItem =
      this.setInfo.items && this.setInfo?.items[this.randomItemIndexVisitMap[pointerPosition]]

    if (!rawItem) return null

    if (this.isItemHidden(rawItem._id)) {
      pointerChangeCallback(skipStep)
      return this.getItemAtPointer(pointerPosition + skipStep, skipStep)
    }

    const { _id: setId, name: setTitle, fromLanguage, toLanguage, setType } = this.setInfo || {}

    return rawItem
      ? ({
        setId: setId || "",
        setTitle: setTitle || "",
        isStared: this.itemsInPageInteractionMap[rawItem._id]?.includes(ItemsInteractionStar) ? "stared" : "",
        fromLanguage,
        toLanguage,
        setType,
        ...rawItem,
      } as SetInfoItem)
      : null
  }

  public isItemHidden(itemId: string): boolean {
    const itemInteractions = this.itemsInPageInteractionMap[itemId] || []

    !itemInteractions.includes(ItemsInteractionStar) && itemInteractions.includes(ItemsInteractionShow)

    return itemInteractions.includes(ItemsInteractionForcedDone) || itemInteractions.includes(ItemsInteractionIgnore)
  }

  public async appendNextItemsToCurrentSet() {
    if (!this.setInfo) return

    let setWithNextItems: SetInfo | null = null
    switch (this.setInfo.setType) {
      case SetTypeNormal:
        setWithNextItems = await sendGetSetSilentMessage(
          this.setInfo._id,
          this.setInfo.items?.length || 0,
          ItemsLimitPerGet
        )
        break

      case SetTypeReviewStarredItems:
        setWithNextItems = await this.buildStarredItemsSetInfo(this.setInfo.items?.length || 0, StarItemsLimitPerGet)
        break

      default:
        break
    }

    this.appendSetItems(setWithNextItems?.items || [])
  }

  /**
   * If we need to review starred items, we don't show recommendation.
   * If the set got interacted more than 80 percent, then 30% of the time this set is displayed, will show a similar set to recommendation.
   * @returns true if the recommendation card should be displayed in the page.
   */
  public async determineIsNeedRecommendation() {
    if (this.isNeedReviewStaredItems) {
      this.isNeedRecommendation = false
    }

    if (this.isNeedRecommendation) return

    try {
      const minimumShowedItemToStartRecommend = 100
      const { showItemCount, interactItemCount } = this.statistics

      if (
        (showItemCount || 0) > minimumShowedItemToStartRecommend &&
        (interactItemCount || 0) / (showItemCount || 0) < 0.02 &&
        appearInPercent(0.25)
      ) {
        console.debug("suggest after no interaction for a long time")
        sendTrackingMessage(TrackingNameSuggestFromNoInteraction)
        this.isNeedRecommendation = true

        return
      }

      // 2% of the cards will be recommendation.
      if (appearInPercent(0.02)) {
        sendTrackingMessage(TrackingNameSuggestToSubscribeRandomly)
        this.isNeedRecommendation = true

        return
      }
    } catch (error) {
      console.error(error)
    }

    if (!this.setInfo) return

    this.setInfo.itemsInteractions?.forEach((i) => delete i.interactionCount[ItemsInteractionStar])
    this.setInfo.itemsInteractions = this.setInfo.itemsInteractions?.filter(
      (i) => Object.keys(i).length > 0
    )

    const isInteractedMoreThan80Percent =
      (this.setInfo.itemsInteractions?.length || 0) > (this.setInfo.items?.length || 0) * 0.8
    this.isNeedRecommendation = isInteractedMoreThan80Percent && appearInPercent(0.2)
  }

  public async buildStarredItemsSetInfo(skip: number = 0, limit: number = StarItemsLimitPerGet): Promise<SetInfo> {
    let setInfo = {
      name: i18n("my_starred_items"),
      totalItemsCount: this.statistics.starredItemsCount,
      setType: SetTypeReviewStarredItems,
    } as SetInfo

    const items = await sendGetStarredItemsMessage(
      ItemsInteractionStar,
      [ItemsInteractionIgnore, ItemsInteractionForcedDone].join(","),
      skip,
      limit
    )
    items.forEach((item) => (item.isStared = "stared"))

    setInfo.items = items

    return setInfo
  }

  public async determineStatisticsValues() {
    this.statistics.starredItemsCount =
      (await sendCountInteractedItemsMessage(
        ItemsInteractionStar,
        [ItemsInteractionIgnore, ItemsInteractionForcedDone].join(",")
      )) || 0
    this.statistics.showItemCount = (await getStorageSyncData<number>(CacheKeys.showItemCount)) || 0
    this.statistics.interactItemCount = (await getStorageSyncData<number>(CacheKeys.interactItemCount)) || 0
  }

  public determineIsNeedReviewStaredItems() {
    if (this.isNeedReviewStaredItems) return

    const minimumStarredItemToStartReview = 10

    if ((this.statistics.starredItemsCount || 0) >= minimumStarredItemToStartReview && appearInPercent(0.2)) {
      this.isNeedReviewStaredItems = true
    }

    return this.isNeedReviewStaredItems
  }

  public async randomTemplateValues(increaseOnCall: boolean = false): Promise<KeyValuePair[]> {
    console.debug(
      "randomTemplateValues called, isLoggedIn: " +
      this.isLoggedIn +
      ", havingSubscribedSets: " +
      this.havingSubscribedSets +
      ", items count: " +
      this.setInfo?.items?.length
    )

    if (this.lastError) {
      const networkErrorValues = await getNetworkErrorTemplateValues(this.lastError)

      if (networkErrorValues && networkErrorValues.length > 0) {
        return networkErrorValues
      }
    }

    if (!this.isLoggedIn) {
      return getNotLoggedInTemplateValues()
    }

    if (!this.havingSubscribedSets) {
      return getNotSubscribedTemplateValues()
    }

    if (this.isNeedReviewStaredItems) {
      this.isNeedReviewStaredItems = false
      return getSuggestReviewTemplateValues(this.statistics.starredItemsCount || 0)
    }

    if (this.isNeedRecommendation) {
      this.isNeedRecommendation = false
      return getRecommendationTemplateValues(this.setInfo, this.getIdentity())
    }

    const item = await this.getItemAtPointer(this.currentItemPointer)
    if (increaseOnCall) {
      this.currentItemPointer++

      if (this.isDisplayedAllItemsInSet) {
        return []
      }
    }

    let templateValues: KeyValuePair[] = []
    if (item) {
      try {
        await sendInteractItemMessage(this.setId || "", item._id || "", ItemsInteractionShow)
        this.interactItem(item._id, ItemsInteractionShow)

        templateValues = await toTemplateValues(item, generateTemplateExtraValues(item))
      } catch (error) {
        console.error(templateValues)
      }
    }

    return templateValues
  }
}