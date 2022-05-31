import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SeedInfo } from "@/common/types/types"
import MarketplaceSider from "@/pages/app/components/MarketplaceSider"
import SeedItemCard from "@/pages/app/components/SeedItemCard"
import { isElementAtBottom } from "@/pages/content-script/domHelpers"
import { Col, Layout, Row, Select, Skeleton, Typography } from "antd"
import * as React from "react"
import { MarketPlaceContext } from "../contexts/MarketplaceContext"

const { Content } = Layout
const { Option } = Select
const { useState, useEffect } = React

const i18n = chrome.i18n.getMessage

const StoreFront = (props: any) => {
  const { user, http } = useGlobalContext()
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [totalSeedsCount, setTotalSeedsCount] = useState<number>(10)
  const [seeds, setSeeds] = useState<any[]>([])

  const filterOptions = [
    {
      value: "lowest",
      label: i18n("marketplace_lowest_price"),
    },
    {
      value: "highest",
      label: i18n("marketplace_highest_price"),
    },
    {
      value: "latest",
      label: i18n("marketplace_latest"),
    },
  ]

  const limitItemsPerGet = 9
  const hasMore = () => !!totalSeedsCount && seeds.length < totalSeedsCount

  const seed: SeedInfo = {
    _id: "df",
    name: "Cactus - Succulents",
    categoryNames: ["Cactus - Succulents", "Herbs"],
    imgUrl: "https://static.lazyvaccine.com/6485262474387409_4477730553303086_1638961550266.jpg",
    price: 23,
  }

  function handleChange(value: any) {
    console.log(`selected ${value}`)
  }

  function onPageLoaded() {
    if (!http) return
  }

  function onSetsListScroll(e: MouseEvent) {
    if (hasMore() && isElementAtBottom(e.target as HTMLElement)) {
    }
  }

  useEffect(onPageLoaded, [http])
  useEffect(() => setLoading(false), [])

  return (
    <MarketPlaceContext.Provider value={{}}>
      <Skeleton active loading={loading}>
        <Layout className="body-content">
          <MarketplaceSider {...props} width={250} path={""} />
          <Layout style={{ padding: 24, paddingTop: 10 }}>
            <Content>
              {totalSeedsCount ? (
                <>
                  <Row justify="space-between">
                    <Col>
                      <Typography.Title level={3}>
                        {totalSeedsCount} {i18n("marketplace_seeds")}
                      </Typography.Title>
                    </Col>
                    <Col>
                      <Select defaultValue="lowest" className="select-box" onChange={handleChange}>
                        {filterOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  <SeedItemCard seed={seed}></SeedItemCard>
                </>
              ) : (
                isSearching && <Skeleton avatar paragraph={{ rows: 3 }} active />
              )}
            </Content>
          </Layout>
        </Layout>
      </Skeleton>
    </MarketPlaceContext.Provider>
  )
}

export default StoreFront
