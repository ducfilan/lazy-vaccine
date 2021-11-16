import * as React from "react"

import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { HomeContext } from "./contexts/HomeContext"
import { Layout, notification, Skeleton } from "antd"

import TopSets from "./components/TopSets"
import CategoriesSider from "./components/CategoriesSider"

const { Content } = Layout

const { useState, useEffect } = React

const HomePage = (props: any) => {
  const { http } = useGlobalContext()
  const [loading, setLoading] = useState<boolean>(true)

  function onPageLoaded() {
    if (!http) return
  }

  useEffect(onPageLoaded, [http])
  useEffect(() => setLoading(false), [])

  return (
    <HomeContext.Provider value={{}}>
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <CategoriesSider width={250} path={""} />
          <Layout style={{ padding: 24 }}>
            <Content>
              <TopSets />
            </Content>
          </Layout>
        </Layout>
      </Skeleton>
    </HomeContext.Provider>
  )
}

export default HomePage
