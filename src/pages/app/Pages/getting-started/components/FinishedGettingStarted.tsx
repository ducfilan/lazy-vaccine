import React, { useEffect, useState } from "react"

import { AppBasePath, AppPages, i18n, RegisterStepsLabels } from "@/common/consts/constants"
import WakeImg from "@img/emojis/shiba/wake.png"
import { Button, Input, notification, Tag } from "antd"

import PopupHeader from "@/pages/popup/components/Header"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { formatString } from "@/common/utils/stringUtils"

import { TrackingNameDoneActivation } from "@/common/consts/trackingNames"
import FriendRoad from "@/pages/app/components/FriendRoad"
import NextPrevButton from "@/pages/popup/components/NextPrevButton"
import RegisterSteps from "@/common/consts/registerSteps"
import { Category, User } from "@/common/types/types"
import { updateUserInfo } from "@/common/repo/user"
import { getTopSearchKeywords } from "@/common/repo/staticApis"
import Loading from "@/common/components/Loading"
import { getTopCategories } from "@/common/repo/category"

export default function FinishedGettingStarted() {
  const { user, http, setUser } = useGlobalContext()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [topSearchKeywords, setTopSearchKeywords] = useState<string[]>()
  const [topCategories, setTopCategories] = useState<Category[]>()

  useEffect(() => {
    if (!http || !user) {
      return
    }

    Promise.all([getTopCategories(http, user.locale), getTopSearchKeywords()])
      .then(([categories, keywords]) => {
        setTopCategories(categories)
        setTopSearchKeywords(keywords)
      })
      .catch((e) =>
        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      )
      .finally(() => setIsLoading(false))
  }, [])

  const goBack = async () => {
    try {
      if (!user) return

      const prevStep = RegisterSteps.prev(user.finishedRegisterStep)
      const updatedUserInfo: User = {
        ...user,
        finishedRegisterStep: prevStep,
      }

      http && (await updateUserInfo(http, { finishedRegisterStep: prevStep }))

      setUser(updatedUserInfo)
    } catch (error) {
      // TODO: Handle more types of error: Server/Timeout/Network etc..
      notification["error"]({
        message: i18n("error"),
        description: i18n("unexpected_error_message"),
        duration: null,
      })
    }
  }

  const openSearchPage = (keyword: string) => {
    window.heap.track(TrackingNameDoneActivation)
    window.open(
      `${chrome.runtime.getURL(AppBasePath)}${AppPages.Sets.path}?keyword=${encodeURIComponent(keyword)}`,
      "_self"
    )
  }

  const openCategoriesPage = (categoryId: string) => {
    window.heap.track(TrackingNameDoneActivation)
    window.open(
      `${chrome.runtime.getURL(AppBasePath)}${AppPages.CategorySets.path.replace(":categoryId", categoryId)}`,
      "_self"
    )
  }

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <div className="first-time-intro--wrapper is-relative">
        <PopupHeader
          content={formatString(i18n("popup_introduce_finished"), [{ key: "user_name", value: user?.name || "" }])}
          iconUrl={WakeImg}
        />
      </div>

      <div className="first-time-intro--body-wrapper">
        <NextPrevButton direction={"left"} onPrev={goBack} />

        <Input.Search
          placeholder={i18n("suggestion_card_search_placeholder")}
          size="large"
          enterButton
          onSearch={openSearchPage}
        />

        <div className="top-keywords--wrapper">
          <h3>{i18n("common_top_searches")}</h3>
          {topSearchKeywords?.map((keyword) => (
            <Tag onClick={openSearchPage.bind(null, keyword)}>{keyword}</Tag>
          ))}
        </div>

        <div className="categories-list--wrapper">
          <h3>{i18n("common_browse_categories")}</h3>
          {topCategories?.map((category) => (
            <Button size="large" onClick={openCategoriesPage.bind(null, category.value)}>
              {category.title}
            </Button>
          ))}
        </div>
      </div>
      <FriendRoad steps={RegisterStepsLabels} />
    </>
  )
}
