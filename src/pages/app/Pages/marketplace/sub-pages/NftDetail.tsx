import { i18n } from "@/common/consts/constants"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { getMissions } from "@/common/repo/mission"
import { Attribute, Mission } from "@/common/types/types"
import { LeftOutlined } from "@ant-design/icons"
import { Button, Checkbox, Col, Collapse, Result, Row, Skeleton, Statistic } from "antd"
import * as React from "react"
import { useMarketPlaceContext } from "../contexts/MarketplaceContext"
import "../css/nft-detail.scss"

const { Panel } = Collapse
const { useState, useEffect } = React

const HardnessAttributeKey = "hardness"
const HardinessAttributeKey = "hardiness"
const HeightAttributeKey = "height"
const SpreadAttributeKey = "spread"
const MaintenanceAttributeKey = "maintenance"

const MissionTraitTypePrefix = "mission_id_"

const MaxHardness = 10

function determineAttributeSuffix(traitType: string) {
  switch (traitType.toLowerCase()) {
    case HardnessAttributeKey:
    case HardinessAttributeKey:
    case MaintenanceAttributeKey:
      return `/ ${MaxHardness}`

    case HeightAttributeKey:
    case SpreadAttributeKey:
      return "m"

    default:
      return ""
  }
}

const NftDetail = () => {
  const { http } = useGlobalContext()
  const [loading, setLoading] = useState<boolean>(false)

  const { selectedNftInfo, setSelectedNftInfo } = useMarketPlaceContext()
  const [selectedNftInfoAttrs, setSelectedNftInfoAttrs] = useState<Attribute[]>([])
  const [selectedNftMissionIds, setSelectedNftMissionIds] = useState<number[]>([])
  const [selectedNftMission, setSelectedNftMission] = useState<Mission[]>([])

  useEffect(() => {
    setLoading(false)
    if (selectedNftInfo && selectedNftInfo.attributes.length > 0) {
      const attrs = selectedNftInfo.attributes.filter((attr) => !attr.trait_type.startsWith(MissionTraitTypePrefix))
      const missionIds = selectedNftInfo.attributes
        .filter((attr) => attr.trait_type.startsWith(MissionTraitTypePrefix))
        .map((attr) => Number(`${attr.value}`))

      setSelectedNftInfoAttrs(attrs)
      setSelectedNftMissionIds(missionIds)
    }
  }, [selectedNftInfo])

  function onPageLoaded() {
    if (!http) return
  }

  useEffect(onPageLoaded, [http])

  useEffect(() => {
    if (!http || !selectedNftMissionIds || selectedNftMissionIds.length === 0) return

    getMissions(http, selectedNftMissionIds).then(setSelectedNftMission)
  }, [selectedNftMissionIds])

  return (
    <div className="nft-detail-wrapper">
      <Skeleton active loading={loading}>
        <Row justify="start">
          <Col span={4}>
            <Button
              type="link"
              icon={<LeftOutlined />}
              onClick={() => {
                setSelectedNftInfo(null)
              }}
            >
              {i18n("common_back")}
            </Button>
          </Col>
        </Row>

        <Result
          style={{ position: "relative" }}
          icon={
            <>
              <img src={selectedNftInfo?.image} />
              <div className="shadow"></div>
              <div className="sky-background-wrapper">
                <div className="center"></div>
                <div className="sun"></div>
                <div className="cloud1">
                  <div className="ground"></div>
                  <div className="circle1"></div>
                  <div className="circle2"></div>
                  <div className="circle3"></div>
                  <div className="circle4"></div>
                </div>
                <div className="cloud2">
                  <div className="ground"></div>
                  <div className="circle1"></div>
                  <div className="circle2"></div>
                  <div className="circle3"></div>
                  <div className="circle4"></div>
                  <div className="circle5"></div>
                </div>
                <div className="cloud3">
                  <div className="circle1"></div>
                  <div className="circle2"></div>
                  <div className="circle3"></div>
                  <div className="circle4"></div>
                  <div className="circle5"></div>
                </div>
              </div>
            </>
          }
          title={selectedNftInfo?.name}
          subTitle={selectedNftInfo?.attributes.find((attr) => attr.trait_type == "Plant Type")?.value}
        />

        <Collapse defaultActiveKey={["1", "2", "3"]} className="margin-16px">
          <Panel header={i18n("common_introduction")} key="1">
            <p>{selectedNftInfo?.description}</p>
          </Panel>
          <Panel header={i18n("common_properties")} key="2">
            <Row gutter={24}>
              {selectedNftInfoAttrs.map((attr) => {
                return (
                  <Col span={8}>
                    <Statistic
                      title={attr.trait_type}
                      value={attr.value}
                      suffix={determineAttributeSuffix(attr.trait_type)}
                    />
                  </Col>
                )
              })}
            </Row>
          </Panel>
          <Panel header={i18n("seed_growing_conditions")} key="3">
            {selectedNftMission.map((mission) => (
              <Row key={mission.missionId}>
                <Checkbox checked={false}>{mission.missionDetail}</Checkbox>
              </Row>
            ))}
          </Panel>
        </Collapse>
      </Skeleton>
    </div>
  )
}

export default NftDetail
