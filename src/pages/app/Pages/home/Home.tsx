import CacheKeys from "@/common/consts/cacheKeys"
import { i18n } from "@/common/consts/constants"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import useLocalStorage from "@/common/hooks/useLocalStorage"
import { getCategories } from "@/common/repo/category"
import { Category } from "@/common/types/types"
import CategoriesSider from "@/pages/app/components/CategoriesSider"
import { Layout, List, Skeleton, Typography } from "antd"
import * as React from "react"
import TopSets from "./components/TopSets"
import TopSetsInCategory from "./components/TopSetsInCategory"
import { HomeContext } from "./contexts/HomeContext"

const { Content } = Layout
const { useState, useEffect } = React

const HomePage = (props: any) => {
  const { user, http } = useGlobalContext()
  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>()
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>(CacheKeys.categories, [], "1d")

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
      getCategories(http, user.locale).then((newCategories: Category[]) => {
        setCategories(newCategories)
        setCachedCategories(newCategories)
      })
    }
  }, [http, user])

  return (
    <HomeContext.Provider
      value={{
        categories,
        setCategories,
      }}
    >
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <CategoriesSider {...props} width={250} path={""} categories={categories} />
          <Layout style={{ padding: 24 }}>
            <Content>
              {categories && categories.length > 0 && (
                <>
                  <Typography.Title level={3} className="top--25px">
                    {i18n("home_everyone_favorite")}
                  </Typography.Title>
                  <TopSets />
                  <List
                    dataSource={categories.filter((c) => c.isTopCategory)}
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
