import * as React from "react"
import parse from "html-react-parser"

import { Col, Row, Typography, Image, Card, Button, Space, Statistic } from "antd"
import { AimOutlined, LikeFilled, DislikeFilled } from "@ant-design/icons"
import { SetInfo } from "@/common/types/types"
import {
  AppPages,
  ColorPrimary,
  InteractionDislike,
  InteractionLike,
  InteractionSubscribe,
} from "@/common/consts/constants"
import { formatString, langCodeToName } from "@/common/utils/stringUtils"
import { Link } from "react-router-dom"
import { interactToSet, undoInteractToSet } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { useState } from "react"

const setImgStyle = {
  borderRadius: "40% 70% 70% 40%",
}

const i18n = chrome.i18n.getMessage

const SetItemCardLong = (props: { set: SetInfo }) => {
  const { http } = useGlobalContext()
  const [isSubscribed, setIsSubscribed] = useState<boolean>(props.set.isSubscribed || false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLiked, setIsLiked] = useState<boolean>(props.set.isLiked || false)
  const [isDisliked, setIsDisliked] = useState<boolean>(props.set.isDisliked || false)
  const [likeCount, setLikeCount] = useState<number>(props.set.interactionCount?.like || 0)
  const [dislikeCount, setDislikeCount] = useState<number>(props.set.interactionCount?.dislike || 0)

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

    caller(http, props.set._id, action)
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

    undoInteractToSet(http, props.set._id, action).then(() => {
      counterSetter && currentCount !== null && counterSetter(currentCount - 1)
      statusDeterminerSetter(false)
    })
  }

  return (
    <Card style={{ padding: "0 40px", width: "100%" }}>
      <Row justify="space-around" gutter={[16, 0]}>
        <Col flex="none">
          <Image style={setImgStyle} width={200} height={200} src={props.set.imgUrl} preview={false} />
        </Col>
        <Col flex="24">
          <Row>
            <Link
              to={formatString(AppPages.SetDetail.path, [
                {
                  key: "setId",
                  value: props.set._id,
                },
              ])}
            >
              <Typography.Title level={3}>{props.set.name}</Typography.Title>
            </Link>
          </Row>
          <Row>
            <Space size="large">
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
          </Row>
          <Row>
            <Col className="top-set-items--item-language">
              {parse(
                formatString(i18n("set_detail_sub_header_part_1"), [
                  {
                    key: "from_language",
                    value: langCodeToName(props.set.fromLanguage as string),
                  },
                ])
              )}
              {props.set.toLanguage &&
                parse(
                  formatString(i18n("set_detail_sub_header_part_2"), [
                    {
                      key: "to_language",
                      value: langCodeToName(props.set.toLanguage as string),
                    },
                  ])
                )}
            </Col>
          </Row>
          <Row className="top-16px" style={{ minHeight: 58 }}>
            <Typography.Paragraph ellipsis={{ rows: 2 }}>
              {props.set.description || i18n("set_detail_no_desc")}
            </Typography.Paragraph>
          </Row>
          <Row align="bottom">
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
          </Row>
        </Col>
      </Row>
    </Card>
  )
}

export default SetItemCardLong
