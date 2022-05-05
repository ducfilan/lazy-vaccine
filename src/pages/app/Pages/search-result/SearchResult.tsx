import React from "react"

import { useHistory } from "react-router-dom"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

import { SearchResultContext } from "./contexts/SearchResultContext"
import { Layout, Typography } from "antd"

import { Category } from "@/common/types/types"
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

  const { user, http } = useGlobalContext()
  const [categories, setCategories] = useState<Category[]>()
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")
  const [keyword, setKeyword] = useState<string>()

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

  const keywordParam = new URLSearchParams(props.location.search).get("keyword") || ""

  if (!keywordParam) {
    history.push(AppPages.Home.path)
    return <></>
  }

  useEffect(() => {
    setKeyword(keywordParam)
  }, [keywordParam])

  return (
    <SearchResultContext.Provider value={{ categories, setCategories }}>
      <Layout className="body-content">
        <CategoriesSider width={250} path={""} categories={categories} />
        <Layout style={{ padding: 24 }}>
          <Content>
            <Content>
              <Typography.Title level={3} className="top--25px">
                {i18n("common_search_result")}
              </Typography.Title>
              {keyword && <SearchResultItems keyword={keyword} />}
            </Content>
          </Content>
        </Layout>
      </Layout>
    </SearchResultContext.Provider>
  )
}

export default SearchResultPage
