import * as React from "react"
import { Col, Row, Button, Space, Statistic, Tooltip } from "antd"
import { LikeFilled, DislikeFilled, FacebookFilled, TwitterSquareFilled, CopyFilled } from "@ant-design/icons"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

const i18n = chrome.i18n.getMessage

const Interactions = () => {
  const { user } = useGlobalContext()

  return (
    <div className="set-detail--interactions pad-16px">
      <Row gutter={8} align="middle">
        <Col flex="auto">
          <Space size="large">
            <Button type="primary" className="is-uppercase">
              {i18n("common_subscribe")}
            </Button>
            <Statistic
              value={1128}
              valueStyle={{ fontSize: 18 }}
              prefix={
                <Button type="text" shape="circle" size="large" icon={<LikeFilled style={{ color: "grey" }} />} />
              }
            />
            <Statistic
              value={13}
              valueStyle={{ fontSize: 18 }}
              prefix={
                <Button type="text" shape="circle" size="large" icon={<DislikeFilled style={{ color: "grey" }} />} />
              }
            />
          </Space>
        </Col>
        <Col flex="auto">
          <Space size="small" className="float-right set-detail--share-buttons">
            {i18n("set_detail_share_me")}
            <Button shape="circle" type="text" icon={<FacebookFilled className="facebook" />} />
            <Button shape="circle" type="text" icon={<TwitterSquareFilled className="twitter" />} />
            <Tooltip placement="top" title={i18n("set_detail_copy_link")}>
              <Button shape="circle" type="text" icon={<CopyFilled className="copy-text" />} />
            </Tooltip>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default Interactions
