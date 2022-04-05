import * as React from "react"

import { useHistory } from "react-router-dom"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { searchSets } from "@/common/repo/set"

import { SearchResultContext } from "./contexts/SearchResultContext"
import { Layout, Skeleton, Typography } from "antd"

import { Category, SetInfo } from "@/common/types/types"
import SearchResultItems from "./components/SearchResultItems"
import { AppPages } from "@/common/consts/constants"

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

  return (
    <SearchResultContext.Provider value={{ categories, setCategories }}>
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <Layout style={{ padding: 24 }}>
            <Content>
              <Typography.Title level={3} className="top--25px">
                {i18n("common_search_result")}
              </Typography.Title>
              <SearchResultItems sets={searchedSets} />
            </Content>
          </Layout>
        </Layout>
      </Skeleton>
    </SearchResultContext.Provider>
  )
}

export default SearchResultPage
