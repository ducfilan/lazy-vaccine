import * as React from "react"

import { useHistory } from "react-router-dom"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { searchSets } from "@/common/repo/set"

import { SearchResultContext } from "./contexts/SearchResultContext"
import { Layout, Skeleton, Typography } from "antd"

import { Category, SetInfo } from "@/common/types/types"
import SearchResultItems from "./components/SearchResultItems"
import { AppPages } from "@/common/consts/constants"
import CategoriesSider from "@/pages/app/components/CategoriesSider"
import CacheKeys from "@/common/consts/cacheKeys"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { getCategories } from "@/common/repo/category"

const { Content } = Layout

const { useState, useEffect } = React

const i18n = chrome.i18n.getMessage

const SearchResultPage = (props: any) => {
  const history = useHistory()

  const keyword = new URLSearchParams(props.location.search).get("keyword")
  if (!keyword) {
    history.push(AppPages.Home.path)
    return <></>
  }

  const { user, http } = useGlobalContext()
  const [searchedSets, setSearchedSets] = useState<SetInfo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>()
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")

  useEffect(() => {
    if (!http || !user) return

    searchSets(http, keyword).then((sets: SetInfo[]) => {
      setSearchedSets(sets)
    })
  }, [http, user])

  function onPageLoaded() {
    if (!http) return
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

  return (
    <SearchResultContext.Provider value={{ categories, setCategories }}>
      <Layout className="body-content">
        <CategoriesSider width={250} path={""} categories={categories} />
        <Layout style={{ padding: 24 }}>
          <Content>
            <Skeleton active loading={loading}>
              <Content>
                <Typography.Title level={3} className="top--25px">
                  {i18n("common_search_result")}
                </Typography.Title>
                <SearchResultItems sets={searchedSets} />
              </Content>
            </Skeleton>
          </Content>
        </Layout>
      </Layout>
    </SearchResultContext.Provider>
  )
}

export default SearchResultPage
