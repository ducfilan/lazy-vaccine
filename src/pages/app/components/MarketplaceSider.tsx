import { i18n } from "@/common/consts/constants"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { Button, Divider, InputNumber, Layout, Slider, Space, Typography } from "antd"
import * as React from "react"
import { useNavigate } from "react-router-dom"

const { Title } = Typography
const { Sider } = Layout

const { useState, useEffect, useMemo } = React

const MarketplaceSider = (props: any) => {
  const { http } = useGlobalContext()
  const navigate = useNavigate()
  const plantTypes = [
    { id: 1, name: "Annuals" },
    { id: 2, name: "Bulbs" },
    { id: 3, name: "Cactus - Succulents" },
    { id: 4, name: "Climbers" },
    { id: 5, name: "Conifers" },
    { id: 6, name: "Ferns" },
    { id: 7, name: "Fruit" },
    { id: 8, name: "Herbs" },
    { id: 9, name: "Ornamental Grasses" },
    { id: 10, name: "Perennials" },
    { id: 11, name: "Roses" },
    { id: 12, name: "Shrubs" },
    { id: 13, name: "Trees" },
    { id: 14, name: "Palms - Cycads" },
    { id: 15, name: "Bamboos" },
    { id: 16, name: "Aquatic Plants" },
    { id: 17, name: "Orchids" },
  ]

  const marks = {
    0: "Low",
    50: "Medium",
    100: "High",
  }

  return (
    <Sider width={props.width} className="marketplace-sider--wrapper pad-16px">
      <Title level={4}>{i18n("common_filter")}</Title>
      <Divider />
      <Title level={5}>{i18n("marketplace_plant_type")}</Title>
      <div className="plant-type--wrapper top-8px">
        {plantTypes.map((plantType) => (
          <Button ghost key={plantType.id} type="primary" className="plant-type--item" size="small">
            {plantType.name}
          </Button>
        ))}
      </div>
      <Title level={5}>{i18n("marketplace_time_harvest")}</Title>
      <Space className="top-8px">
        <div>
          <p className="margin-0">{i18n("common_from")}</p>
          <InputNumber min={0} max={100} defaultValue={0} />
        </div>
        <div className="top-16px">-</div>
        <div>
          <p className="margin-0">{i18n("common_to")}</p>
          <InputNumber min={0} max={100} defaultValue={100} />
        </div>
      </Space>
      <Title level={5}>{i18n("marketplace_roi")}</Title>
      <Slider marks={marks} step={null} defaultValue={0} className="top-8px" />
    </Sider>
  )
}

export default MarketplaceSider
