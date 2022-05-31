import { AppPages } from "@/common/consts/constants"
import { SeedInfo } from "@/common/types/types"
import { formatString } from "@/common/utils/stringUtils"
import SolanaIcon from "@img/ui/solana-sol-logo.png"
import { Card, Space, Typography } from "antd"
import React from "react"
import { Link } from "react-router-dom"

const SeedItemCard = (props: { seed: SeedInfo }) => {
  return (
    <Card
      className="card-seed-item"
      style={{ width: 300 }}
      cover={<img alt={props.seed.name} src={props.seed.imgUrl} />}
      actions={[
        <Space size="large">
          <p className="margin-0">
            <img src={SolanaIcon} width="15" height="15" /> 0.01 ($10)
          </p>
        </Space>,
      ]}
    >
      <Card.Meta
        style={{ textAlign: "center" }}
        title={
                   <Link
                   to={formatString(AppPages.SeedDetail.path, [
                     {
                       key: "seedId",
                       value: props.seed._id,
                     },
                   ])}
                 >
                   <Typography.Title level={3}>{props.seed.name}</Typography.Title>
                 </Link>
        }
        description={
          <Space className="pad-top-bottom-8px">
            {props.seed.categoryNames.map((category) => (
              <span key={category} className="category-item">
                {category}
              </span>
            ))}
          </Space>
        }
      />
    </Card>
  )
}

export default SeedItemCard
