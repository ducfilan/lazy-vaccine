import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { SeedInfo } from "@/common/types/types"
import SolanaIcon from "@img/ui/solana-sol-logo.png"
import { Card, Space } from "antd"
import React, { useState } from "react"
import { Link } from "react-router-dom"

const { useCallback } = React

const i18n = chrome.i18n.getMessage

const SeedItemCard = (props: { seed: SeedInfo }) => {
  const { http } = useGlobalContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  return (
    <Card
      className="card-seed-item"
      style={{ width: 300 }}
      cover={<img alt={props.seed.name} src={props.seed.imgUrl} />}
      actions={[
        <Space
          size="large"
        >
          <p className="margin-0"><img src={SolanaIcon} width="15" height="15" /> 0.01 ($10)</p>
        </Space>]}
    >
      <Card.Meta
        style={{ textAlign: 'center' }}
        title={
          <Link to={`/marketplace/${props.seed._id}`} title={props.seed.name}>
            {props.seed.name}
          </Link>
        }
        description={
          <Space className="pad-top-bottom-8px">
            {props.seed.categoryNames.map(category => <span key={category} className="category-item">{category}</span>)}
          </Space>
        }
      />
    </Card>
  )
}

export default SeedItemCard
