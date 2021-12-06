import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { HomeContext } from "./contexts/HomeContext"
import { Col, Layout, List, Skeleton, Typography } from "antd"

import TopSets from "./components/TopSets"
import CategoriesSider from "./components/CategoriesSider"
import TopSetsInCategory from "./components/TopSetsInCategory"
import { Category } from "@/common/types/types"

const { Content } = Layout

const { useState, useEffect } = React

const i18n = chrome.i18n.getMessage

const HomePage = (props: any) => {
  const { http } = useGlobalContext()
  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>()

  function onPageLoaded() {
    if (!http) return
  }

  useEffect(onPageLoaded, [http])
  useEffect(() => setLoading(false), [])

  return (
    <HomeContext.Provider value={{ categories, setCategories }}>
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <CategoriesSider width={250} path={""} />
          <Layout style={{ padding: 24 }}>
            <Content>
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
            </Content>
          </Layout>
        </Layout>
      </Skeleton>
    </HomeContext.Provider>
  )
}

export default HomePage
