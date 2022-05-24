import { useGlobalContext } from "@/common/contexts/GlobalContext";
import { LeftOutlined } from "@ant-design/icons";
import SolanaIcon from "@img/ui/solana-sol-logo.png";
import { Button, Checkbox, Col, Collapse, Row, Skeleton, Space, Statistic, Tag, Typography } from "antd";
import * as React from "react";
import { SeedDetailContext } from "./contexts/SeedDetailContext";

const { Panel } = Collapse;
const i18n = chrome.i18n.getMessage
const { useState, useEffect } = React

const SeedDetailPage = (props: any) => {
  const { http } = useGlobalContext()
  const [loading, setLoading] = useState<boolean>(false)
  function onPageLoaded() {
    if (!http) return
  }

  useEffect(onPageLoaded, [http])

  return (
    <SeedDetailContext.Provider value={{}}>
      <Skeleton active loading={loading}>
        <Row justify="start">
          <Col span={4}>
            <Button type="link" icon={<LeftOutlined />}>
              {i18n("common_back")}
            </Button>
          </Col>
        </Row>
        <Row justify="end">
          <span className="price-wrapper">
            <img src={SolanaIcon} width="24" height="24" />{" "}
            <span className="price-label">0.01 ($10)</span>
          </span>
          <Button type="primary" className="left-16px">
            {i18n("common_buy_now")}
          </Button>
        </Row>
        <Row justify="center">
          <div className="seed-info-wrapper">
            <div className="seed-image">
              <img src="https://static.lazyvaccine.com/6485262474387409_4477730553303086_1638961550266.jpg" />
            </div>
            <Typography.Title level={3} className="margin-0">Laplace</Typography.Title>
            <Space className="pad-top-bottom-8px">
              <Tag>Herbs</Tag>
              <Tag>Cactus - Succulents</Tag>
            </Space>
            <p>{i18n("common_owner")}: <span className="owner-label">Duc Hoang</span></p>
            <Tag>
              <a href="#">0x123456 7890</a>
            </Tag>
          </div>
        </Row>
        <Collapse defaultActiveKey={['1']} className="margin-16px">
          <Panel header={i18n("common_introduction")} key="1">
            <p>{'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has btook a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap inted. It was p'}</p>
          </Panel>
          <Panel header={i18n("common_properties")} key="2">
            <Row gutter={24}>
              <Col span={8}>
                <Statistic title={i18n("properties_hardness")} value={5} suffix="/ 10" />
              </Col>
              <Col span={8}>
                <Statistic title={i18n("properties_maintenance")} value={'Low'} />
              </Col>
              <Col span={8}>
                <Statistic title={i18n("properties_height")} value={'20-35m'} />
              </Col>
            </Row>
          </Panel>
          <Panel header={i18n("seed_growing_conditions")} key="3">
            <Row>
              <Checkbox checked={true}>Condition 1</Checkbox>
            </Row>
            <Row>
              <Checkbox checked={false} >Condition 2</Checkbox>
            </Row>
          </Panel>
        </Collapse>
      </Skeleton>
    </SeedDetailContext.Provider>
  )
}

export default SeedDetailPage
