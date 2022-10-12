import React from "react"

import { useSearchParams } from "react-router-dom"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { SearchResultContext } from "./contexts/SearchResultContext"
import { Layout, Skeleton, Typography } from "antd"

import { Category } from "@/common/types/types"
import SearchResultItems from "./components/SearchResultItems"
import { i18n } from "@/common/consts/constants"
import CategoriesSider from "@/pages/app/components/CategoriesSider"
import CacheKeys from "@/common/consts/cacheKeys"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { getCategories } from "@/common/repo/category"
import { TrackingNameOpenSearchResultPage } from "@/common/consts/trackingNames"

const { Content } = Layout

const { useState, useEffect } = React

const SearchResultPage = () => {
  const { user, http } = useGlobalContext()
  const [categories, setCategories] = useState<Category[]>()
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")
  const [searchParams] = useSearchParams()

  useEffect(() => {
    window.heap.track(TrackingNameOpenSearchResultPage, { keyword: searchParams.get("keyword") })
  }, [])

  useEffect(() => {
    if (!http || !user) return

    if (cachedCategories) {
      setCategories(cachedCategories)
    } else {
      getCategories(http, user.locale).then((newCategories: Category[]) => {
        setCategories(newCategories)
        setCachedCategories(newCategories)
      })
    }
  }, [http, user])

  return !http || !user || !categories ? (
    <Skeleton active />
  ) : (
    <SearchResultContext.Provider value={{ categories, setCategories }}>
      <Layout className="body-content">
        <CategoriesSider width={250} path={""} categories={categories} />
        <Layout style={{ padding: 24 }}>
          <Content>
            <Content>
              <Typography.Title level={3} className="top--25px">
                {i18n("common_search_result")}
              </Typography.Title>
              <SearchResultItems keyword={searchParams.get("keyword")!} languages={user?.langCodes || []} />
            </Content>
          </Content>
        </Layout>
      </Layout>
    </SearchResultContext.Provider>
  )
}

export default SearchResultPage
