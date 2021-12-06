import * as React from "react"

import { Card, Avatar, Button, Space, Typography } from "antd"
import { UserOutlined, AimOutlined, LikeFilled, DislikeFilled } from "@ant-design/icons"
import { SetInfo } from "@/common/types/types"

const i18n = chrome.i18n.getMessage

const SetItemCardSmall = (props: { set: SetInfo }) => {
  return (
    <Card
      style={{ width: 300 }}
      cover={<img alt={props.set.name} src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
      actions={[
        <Button key="subscribe" type="primary" className="is-uppercase" size="large" icon={<AimOutlined />}>
          {i18n("common_subscribe")}
        </Button>,
        <Space key="interactions" size="large">
          <Button type="text" shape="circle" size="large" icon={<LikeFilled style={{ color: "grey" }} />} />
          <Button type="text" shape="circle" size="large" icon={<DislikeFilled style={{ color: "grey" }} />} />
        </Space>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar src={props.set.creatorImageUrl} icon={<UserOutlined />} />}
        title={props.set.name}
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
