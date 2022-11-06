import React from "react"

import { Card, Avatar, Button, Space, Typography } from "antd"
import { UserOutlined, AimOutlined, LikeFilled, DislikeFilled } from "@ant-design/icons"
import { AppBasePath } from "@/common/consts/constants"

const SetItemCardSmall = () => {
  return (
    <Card
      className="card-set-item-small"
      cover={<img alt=":set_name" src=":set_imgUrl" />}
      actions={[
        <Button type="primary" className="subscribe-button is-uppercase" size="large" icon={<AimOutlined />}>
          :subscribe_text
        </Button>,
        <Space key="interactions" size="large">
          <Button
            type="text"
            shape="circle"
            size="large"
            className="like-button"
            icon={<LikeFilled style={{ color: ":like_color" }} />}
          />
          <Button
            type="text"
            shape="circle"
            size="large"
            className="dislike-button"
            icon={<DislikeFilled style={{ color: ":dislike_color" }} />}
          />
        </Space>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar src=":set_creatorImageUrl" icon={<UserOutlined />} />}
        title={
          <a
            className="page-header--title"
            href={`${chrome.runtime.getURL(AppBasePath)}/set-detail/:set__id`}
            title=":set_name"
            target="_blank"
          >
            :set_name
          </a>
        }
        description={<Typography.Paragraph ellipsis={{ rows: 2 }}>:set_description</Typography.Paragraph>}
      />
    </Card>
  )
}

export default SetItemCardSmall
