import React from "react"

import { TreeGrow } from "../components/TreeGrow"
import { useMarketPlaceContext } from "../contexts/MarketplaceContext"
import { getNftsInfo } from "@/common/repo/nft"
import { NftInfo } from "@/common/types/types"
import "../css/growing-nfts.scss"
import { Button, Card, notification, Typography } from "antd"
import { i18n, MarketplaceUrl } from "@/common/consts/constants"
import { ShopOutlined } from "@ant-design/icons"

const { useState, useEffect } = React

const GrowingNfts = () => {
  const { nfts, setSelectedNftInfo } = useMarketPlaceContext()

  const [nftsInfo, setNftsInfo] = useState<NftInfo[]>([])

  useEffect(() => {
    getNftsInfo(nfts.map((nft) => nft.data.uri))
      .then((allNftsInfo) => {
        setNftsInfo(allNftsInfo)
      })
      .catch(() => {
        notification["error"]({
          message: i18n("error"),
          description: i18n("unexpected_error_message"),
          duration: null,
        })
      })
  }, [nfts])

  return (
    <>
      <TreeGrow height={500} />
      <section className="growing-nfts-title--container">
        <h1>
          <span>These trees are</span>
          <span>growing with you</span>
        </h1>
      </section>

      <div className="nft-items-wrapper">
        <div style={{ textAlign: "right", margin: "10px 10px 15px" }}>
          <Button
            type="primary"
            icon={<ShopOutlined />}
            size="large"
            onClick={() => {
              window.open(MarketplaceUrl, "_blank", "noopener,noreferrer")
            }}
          >
            Buy a tree
          </Button>
        </div>
        <Card bordered={false}>
          {nftsInfo.map((nftInfo, i) => {
            return (
              <Card.Grid hoverable={false} style={{ width: "unset", padding: 12, boxShadow: "none" }}>
                <Card
                  key={i}
                  hoverable
                  style={{ width: 240 }}
                  cover={<img alt={nftInfo.name} src={nftInfo.image} />}
                  onClick={() => {
                    setSelectedNftInfo(nftInfo)
                  }}
                >
                  <Card.Meta
                    title={nftInfo.name}
                    description={
                      <Typography.Paragraph
                        ellipsis={{ rows: 3 }}
                        style={{ minHeight: "3.143em" }}
                        title={nftInfo.description}
                      >
                        {nftInfo.description || i18n("set_detail_no_desc")}
                      </Typography.Paragraph>
                    }
                  />
                </Card>
              </Card.Grid>
            )
          })}
        </Card>
      </div>
    </>
  )
}

export default GrowingNfts
