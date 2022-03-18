import * as React from "react"

import { Card, Avatar, Button, Space, Typography } from "antd"
import { UserOutlined, AimOutlined, LikeFilled, DislikeFilled } from "@ant-design/icons"
import { SetInfo } from "@/common/types/types"
import { Link } from "react-router-dom"
import { useState } from "react"
import { subscribeToSet } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { ColorPrimary } from "@/common/consts/constants"

const i18n = chrome.i18n.getMessage

const SetItemCardSmall = (props: { set: SetInfo }) => {
  const { http } = useGlobalContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(props.set.isSubscribed || false)
  const [isLiked, setIsLiked] = useState<boolean>(props.set.isLiked || false)

  return (
    <Card
      style={{ width: 300 }}
      cover={<img alt={props.set.name} src={props.set.imgUrl} />}
      actions={[
        <Button
          key="subscribe"
          type="primary"
          className="is-uppercase"
          size="large"
          icon={<AimOutlined />}
          loading={isLoading}
          onClick={() => {
            if (!http) return
            setIsLoading(true)
            subscribeToSet(http, props.set._id)
              .then(() => setIsSubscribed(!isSubscribed))
              .finally(() => setIsLoading(false))
          }}
        >
          {i18n(isSubscribed ? "common_unsubscribe" : "common_subscribe")}
        </Button>,
        <Space key="interactions" size="large">
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={<LikeFilled style={{ color: isLiked ? ColorPrimary : "grey" }} />}
          />
          <Button type="text" shape="circle" size="large" icon={<DislikeFilled style={{ color: "grey" }} />} />
        </Space>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar src={props.set.creatorImageUrl} icon={<UserOutlined />} />}
        title={
          <Link className="page-header--title" to={`/set-detail/${props.set._id}`}>
            {props.set.name}
          </Link>
        }
        description={
          <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ minHeight: "3.143em" }}>
            {props.set.description || i18n("set_detail_no_desc")}
          </Typography.Paragraph>
        }
      />
    </Card>
  )
}

export default SetItemCardSmall
