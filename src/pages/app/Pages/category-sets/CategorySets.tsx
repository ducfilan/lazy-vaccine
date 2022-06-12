import CacheKeys from "@/common/consts/cacheKeys"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { getCategories } from "@/common/repo/category"
import { getSetsInCategory } from "@/common/repo/set"
import { Category, SetInfo, SetsInCategoryResponse } from "@/common/types/types"
import { Divider, Layout, List, notification, Skeleton, Typography } from "antd"
import * as React from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { useParams } from "react-router-dom"
import CategoriesSider from "@/pages/app/components/CategoriesSider"
import SetItemCardSmall from "@/pages/app/components/SetItemCardSmall"
import { CategorySetsContext } from "./contexts/CategorySetsContext"
import parse from "html-react-parser"
import { formatString } from "@/common/utils/stringUtils"
import { isElementAtBottom } from "@/pages/content-script/domHelpers"
import { i18n } from "@/common/consts/constants"

const { Content } = Layout
const { useState, useEffect } = React

const CategorySetsPage = (props: any) => {
  const { user, http } = useGlobalContext()
  const { categoryId }: any = useParams()
  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")
  const [isSearching, setIsSearching] = useState<boolean>(true)
  const [totalSetsCount, setTotalSetsCount] = useState<number>()
  const [skip, setSkip] = useState<number>()
  const [sets, setSets] = useState<SetInfo[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")

  const limitItemsPerGet = 9
  const hasMore = () => !!totalSetsCount && sets.length < totalSetsCount

  function onPageLoaded() {
    if (!http) return
    setSelectedCategoryId(categoryId)
    setSetsInfo()
  }

  function onSetsListScroll(e: MouseEvent) {
    if (hasMore() && isElementAtBottom(e.target as HTMLElement)) {
      setSetsInfo()
    }
  }

  function onChangeCategoryId(categoryId: string) {
    setSelectedCategoryId(categoryId)
    resetStates()
  }

  function resetStates() {
    setSkip(0)
    setTotalSetsCount(0)
    setIsSearching(false)
    setSets([])
  }

  useEffect(onPageLoaded, [http])
  useEffect(() => setLoading(false), [])
  useEffect(() => {
    if (!http || !user) return

    if (cachedCategories) {
      setCategories(cachedCategories)
    } else {
      getCategories(http, user.locale).then((categories: Category[]) => {
        setCategories(categories)
        setCachedCategories(categories)
      })
    }
  }, [http, user])

  useEffect(() => {
    setSetsInfo()
  }, [selectedCategoryId])

  function setSetsInfo() {
    if (!http || !selectedCategoryId) return

    setIsSearching(true)

    getSetsInCategory(http, selectedCategoryId, skip || 0, limitItemsPerGet)
      .then((resp: SetsInCategoryResponse) => {
        if (Object.keys(resp).length) {
          setIsSearching(false)

          !totalSetsCount && setTotalSetsCount(resp.total)
          setSkip(sets.length + resp.sets.length)
          setSets([...sets, ...resp.sets])
        }
      })
      .catch(() => {
        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }

  function getCategoryName(categoriesList: any[]): string | any {
    for (let category of categoriesList) {
      if (category.key === selectedCategoryId) return category?.title || "---"
      if (Array.isArray(category.children)) {
        let title = getCategoryName(category.children)
        if (title) return title
      }
    }
  }

  return (
    <CategorySetsContext.Provider value={{ selectedCategoryId, onChangeCategoryId }}>
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <CategoriesSider {...props} width={250} path={""} categories={categories} />
          <Layout style={{ padding: 24 }}>
            <Content>
              {totalSetsCount ? (
                <>
                  <Typography.Title level={3} className="top--25px">
                    {parse(
                      formatString(i18n("category_sets_total"), [
                        {
                          key: "total",
                          value: totalSetsCount.toString(),
                        },
                        {
                          key: "category_name",
                          value: getCategoryName(categories),
                        },
                      ])
                    )}
                  </Typography.Title>
                  <InfiniteScroll
                    next={() => {}}
                    dataLength={totalSetsCount}
                    hasMore={hasMore()}
                    loader={<Skeleton avatar paragraph={{ rows: 3 }} active />}
                    endMessage={<Divider plain>{i18n("common_end_list_result")}</Divider>}
                    onScroll={onSetsListScroll}
                  >
                    <List
                      dataSource={sets}
                      grid={{ gutter: 16, column: 3 }}
                      renderItem={(set) => (
                        <List.Item>
                          <SetItemCardSmall set={set} key={set._id} />
                        </List.Item>
                      )}
                    />
                  </InfiniteScroll>
                </>
              ) : (
                isSearching && <Skeleton avatar paragraph={{ rows: 3 }} active />
              )}
            </Content>
          </Layout>
        </Layout>
      </Skeleton>
    </CategorySetsContext.Provider>
  )
}

export default CategorySetsPage
