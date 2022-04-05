import * as React from "react"
import { Col, Row, Button, Space, Statistic, Tooltip } from "antd"
import {
  LikeFilled,
  DislikeFilled,
  FacebookFilled,
  TwitterSquareFilled,
  CopyFilled,
  AimOutlined,
} from "@ant-design/icons"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useState } from "react"
import { useSetDetailContext } from "../contexts/SetDetailContext"
import { ColorPrimary, InteractionDislike, InteractionLike, InteractionSubscribe } from "@/common/consts/constants"
import { interactToSet, undoInteractToSet } from "@/common/repo/set"

const i18n = chrome.i18n.getMessage

const Interactions = () => {
  const { http } = useGlobalContext()
  const { setInfo } = useSetDetailContext()

  if (!setInfo) {
    return <></>
  }

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(setInfo.isSubscribed || false)
  const [isLiked, setIsLiked] = useState<boolean>(setInfo.isLiked || false)
  const [isDisliked, setIsDisliked] = useState<boolean>(setInfo.isDisliked || false)
  const [likeCount, setLikeCount] = useState<number>(setInfo.interactionCount?.like || 0)
  const [dislikeCount, setDislikeCount] = useState<number>(setInfo.interactionCount?.dislike || 0)

  const handleInteract = async (
    statusDeterminer: boolean,
    statusDeterminerSetter: React.Dispatch<React.SetStateAction<boolean>>,
    currentCount: number | null,
    counterSetter: React.Dispatch<React.SetStateAction<number>> | null,
    action: string
  ) => {
    if (!http) return
    setIsLoading(true)

    const caller = !statusDeterminer ? interactToSet : undoInteractToSet
    const counterChangeNumber = !statusDeterminer ? 1 : -1

    caller(http, setInfo._id, action)
      .then(() => {
        statusDeterminerSetter(!statusDeterminer)
        counterSetter && currentCount !== null && counterSetter(currentCount + counterChangeNumber)
      })
      .finally(() => setIsLoading(false))
  }

  const undoInteract = async (
    statusDeterminerSetter: React.Dispatch<React.SetStateAction<boolean>>,
    currentCount: number | null,
    counterSetter: React.Dispatch<React.SetStateAction<number>> | null,
    action: string
  ) => {
    if (!http) return

    undoInteractToSet(http, setInfo._id, action).then(() => {
      counterSetter && currentCount !== null && counterSetter(currentCount - 1)
      statusDeterminerSetter(false)
    })
  }

  return (
    <div className="set-detail--interactions pad-16px">
      <Row gutter={8} align="middle">
        <Col flex="auto">
          <Space size="large">
            <Button
              type="primary"
              className="is-uppercase"
              icon={<AimOutlined />}
              loading={isLoading}
              onClick={() => {
                handleInteract(isSubscribed, setIsSubscribed, null, null, InteractionSubscribe)
              }}
            >
              {i18n(isSubscribed ? "common_unsubscribe" : "common_subscribe")}
            </Button>
            <Statistic
              value={likeCount}
              valueStyle={{ fontSize: 18 }}
              prefix={
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  onClick={() => {
                    handleInteract(isLiked, setIsLiked, likeCount, setLikeCount, InteractionLike)
                    !isLiked &&
                      isDisliked &&
                      undoInteract(setIsDisliked, dislikeCount, setDislikeCount, InteractionDislike)
                  }}
                  icon={<LikeFilled style={{ color: isLiked ? ColorPrimary : "grey" }} />}
                />
              }
            />
            <Statistic
              value={dislikeCount}
              valueStyle={{ fontSize: 18 }}
              prefix={
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  onClick={() => {
                    handleInteract(isDisliked, setIsDisliked, dislikeCount, setDislikeCount, InteractionDislike)
                    !isDisliked && isLiked && undoInteract(setIsLiked, likeCount, setLikeCount, InteractionLike)
                  }}
                  icon={<DislikeFilled style={{ color: isDisliked ? ColorPrimary : "grey" }} />}
                />
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
