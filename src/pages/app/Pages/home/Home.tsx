import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { HomeContext } from "./contexts/HomeContext"
import { Col, Divider, Layout, List, notification, Skeleton, Typography,} from "antd";

import TopSets from "./components/TopSets"
import CategoriesSider from "@/pages/app/components/CategoriesSider"
import TopSetsInCategory from "./components/TopSetsInCategory"
import { Category, SetInfo, SetsInCategoryResponse } from "@/common/types/types"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import CacheKeys from "@/common/consts/cacheKeys"
import { getCategories } from "@/common/repo/category"
import InfiniteScroll from "react-infinite-scroll-component"
import { getSetsInCategory } from "@/common/repo/set"
import SetItemCardSmall from "../../components/SetItemCardSmall"
import { Route } from "react-router-dom"

const { Content } = Layout

const { useState, useEffect } = React

const i18n = chrome.i18n.getMessage

const HomePage = (props: any) => {
  const { user, http } = useGlobalContext()
  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>()
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")
  const [sets, setSets] = useState<SetInfo[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [totalSetsCount, setTotalSetsCount] = useState<number>()
  const [skip, setSkip] = useState<number>()
  const [isSearching, setIsSearching] = useState<boolean>(true)

  const limitItemsPerGet = 9
  const hasMore = () => !!totalSetsCount && sets.length < totalSetsCount

  function onPageLoaded() {
    if (!http) return
    const { pathname } = props.location
    if(pathname.includes('category')) {
      const categoryId = pathname.split('/').pop()
      setSelectedCategoryId(categoryId)
      setSetsInfo()
    }
  }

  function onSetsListScroll(e: MouseEvent) {
    if (hasMore() && isElementAtBottom(e.target as HTMLElement)) {
      setSetsInfo()
    }
  }

  const isElementAtBottom = (target: HTMLElement, threshold: number = 0.8) => {
    if (target.nodeName === "#document") target = document.documentElement;

    const clientHeight =
      target === document.body || target === document.documentElement
        ? window.screen.availHeight
        : target.clientHeight;

    return target.scrollTop + clientHeight >= threshold * target.scrollHeight;
  };

  function onCategoryChanged(categoryId: string) {
    setSelectedCategoryId(categoryId)
    resetStates()
  }

  function resetStates() {
    setSkip(0)
    setTotalSetsCount(0)
    setIsSearching(false)
    setSets([])
  }

  useEffect(onPageLoaded, [http]);
  useEffect(() => setLoading(false), []);
  useEffect(() => {
    const { pathname } = props.location
    if(!pathname.includes('category')) {
      resetStates()
      setSelectedCategoryId('')
    }
  }, [props.location]);
  useEffect(onPageLoaded, [http]);
  useEffect(() => setLoading(false), []);
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
  },
  [selectedCategoryId]);

  function setSetsInfo() {
    if (!http || !selectedCategoryId) return

    setIsSearching(true)

    getSetsInCategory(http, selectedCategoryId, skip || 0, limitItemsPerGet)
      .then((resp: SetsInCategoryResponse) => {
        if(Object.keys(resp).length) {
          setIsSearching(false)

          !totalSetsCount && setTotalSetsCount(resp.total)
          setSkip(sets.length + resp.sets.length)
          setSets([...sets, ...resp.sets])
        }
      })
      .catch(() => {
        notification["error"]({
          message: chrome.i18n.getMessage("error"),
          description: chrome.i18n.getMessage("unexpected_error_message"),
          duration: null,
        })
      })
  }

  return (
    <HomeContext.Provider
      value={{
        categories,
        setCategories,
        selectedCategoryId,
        onCategoryChanged
      }}
    >
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <CategoriesSider width={250} path={""} categories={categories} />
          <Layout style={{ padding: 24, paddingTop: selectedCategoryId && 0 }}>
            <Content>
            <Route path="/home/category/:id">
              {
                totalSetsCount ? (
                  <InfiniteScroll
                    next={() => { }}
                    dataLength={totalSetsCount}
                    hasMore={hasMore()}
                    loader={<Skeleton avatar paragraph={{ rows: 3 }} active />}
                    endMessage={
                      <Divider plain>{i18n("common_end_list_result")}</Divider>
                    }
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
                ) : isSearching && (
                  <Skeleton avatar paragraph={{ rows: 3 }} active />
                )
              }
            </Route>
              {!selectedCategoryId && categories && categories.length > 0 && (
                <>
                  <Typography.Title level={3} className="top--25px">
                    {i18n("home_everyone_favorite")}
                  </Typography.Title>
                  <TopSets />
                  <List
                    dataSource={categories}
                    renderItem={(category) => (
                      <List.Item key={category.key} style={{ display: "block" }}>
                        <TopSetsInCategory categoryId={category.key} title={category.title} />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Content>
          </Layout>
        </Layout>
      </Skeleton>
    </HomeContext.Provider>
  )
}

export default HomePage
