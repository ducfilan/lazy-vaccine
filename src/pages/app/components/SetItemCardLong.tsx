import React, { useState, useCallback } from "react"
import parse from "html-react-parser"

import { Col, Row, Typography, Image, Card, Button, Space, Statistic } from "antd"
import { AimOutlined, LikeFilled, DislikeFilled } from "@ant-design/icons"
import { SetInfo } from "@/common/types/types"
import {
  AppPages,
  ColorPrimary,
  i18n,
  InteractionDislike,
  InteractionLike,
  InteractionSubscribe,
} from "@/common/consts/constants"
import { formatString, langCodeToName } from "@/common/utils/stringUtils"
import { Link } from "react-router-dom"
import { interactToSet, undoInteractToSet } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"

const setImgStyle = {
  borderRadius: "40% 70% 70% 40%",
}

const SetItemCardLong = (props: { set: SetInfo }) => {
  const { http } = useGlobalContext()
  const [isSubscribed, setIsSubscribed] = useState<boolean>(props.set.isSubscribed || false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLiked, setIsLiked] = useState<boolean>(props.set.isLiked || false)
  const [isDisliked, setIsDisliked] = useState<boolean>(props.set.isDisliked || false)
  const [likeCount, setLikeCount] = useState<number>(props.set.interactionCount?.like || 0)
  const [dislikeCount, setDislikeCount] = useState<number>(props.set.interactionCount?.dislike || 0)

  const handleInteract = useCallback(
    async (
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
    },
    [props.set]
  )

  const undoInteract = useCallback(
    async (
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
    },
    [props.set]
  )

  return (
    <Card style={{ padding: "0 40px", width: "100%" }}>
      <Row justify="space-around" gutter={[16, 0]}>
        <Col flex="none">
          <Image
            style={setImgStyle}
            width={200}
            height={200}
            src={props.set.imgUrl}
            preview={false}
            fallback="data:image/png;base64,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"
          />
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
                      window.heap.track(isLiked ? "Unlike set" : "Like set", { setId: props.set._id })
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
                      window.heap.track(isDisliked ? "Undislike set" : "Dislike set", { setId: props.set._id })
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
              className="is-uppercase btn-subscribe"
              icon={<AimOutlined />}
              loading={isLoading}
              onClick={() => {
                window.heap.track(isSubscribed ? "Unsubscribe to set" : "Subscribe to set", { setId: props.set._id })
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
