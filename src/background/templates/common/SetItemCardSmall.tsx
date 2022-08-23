import React from "react"

import { Card, Avatar, Button, Space, Typography } from "antd"
import { UserOutlined, AimOutlined, LikeFilled, DislikeFilled } from "@ant-design/icons"
import { Link } from "react-router-dom"

const SetItemCardSmall = () => {
  return (
    <Card
      className="card-set-item-small"
      cover={<img alt=":set_name" src=":set_imgUrl" />}
      actions={[
        <Button key="subscribe" type="primary" className="is-uppercase" size="large" icon={<AimOutlined />}>
          :subscribe_text
        </Button>,
        <Space key="interactions" size="large">
          <Button type="text" shape="circle" size="large" icon={<LikeFilled style={{ color: ":like_color" }} />} />
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={<DislikeFilled style={{ color: ":dislike_color" }} />}
          />
        </Space>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar src=":set_creatorImageUrl" icon={<UserOutlined />} />}
        title={
          <Link className="page-header--title" to={`/set-detail/:set__id`} title=":set_name">
            :set_name
          </Link>
        }
        description={
          <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ minHeight: "3.143em" }}>
            :set_description
          </Typography.Paragraph>
        }
      />
    </Card>
  )
}

export default SetItemCardSmall
