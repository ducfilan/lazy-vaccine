import React from "react"

import { Card, Avatar, Button, Space, Typography } from "antd"
import { UserOutlined, AimOutlined, LikeFilled, DislikeFilled } from "@ant-design/icons"
import { SetInfo } from "@/common/types/types"
import { Link } from "react-router-dom"
import { interactToSet, undoInteractToSet } from "@/common/repo/set"
import { useGlobalContext } from "@/common/contexts/GlobalContext"
import { ColorPrimary, i18n, InteractionDislike, InteractionLike, InteractionSubscribe } from "@/common/consts/constants"

const { useCallback, useState } = React

const SetItemCardSmall = (props: { set: SetInfo }) => {
  const { http } = useGlobalContext()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(props.set.isSubscribed || false)
  const [isLiked, setIsLiked] = useState<boolean>(props.set.isLiked || false)
  const [isDisliked, setIsDisliked] = useState<boolean>(props.set.isDisliked || false)

  const handleInteract = useCallback(
    async (
      statusDeterminer: boolean,
      statusDeterminerSetter: React.Dispatch<React.SetStateAction<boolean>>,
      action: string
    ) => {
      if (!http) return
      setIsLoading(true)

      const caller = !statusDeterminer ? interactToSet : undoInteractToSet

      caller(http, props.set._id, action)
        .then(() => statusDeterminerSetter(!statusDeterminer))
        .finally(() => setIsLoading(false))
    },
    [props.set]
  )

  const undoInteract = useCallback(
    async (statusDeterminerSetter: React.Dispatch<React.SetStateAction<boolean>>, action: string) => {
      if (!http) return

      undoInteractToSet(http, props.set._id, action).then(() => statusDeterminerSetter(false))
    },
    [props.set]
  )

  return (
    <Card
      className="card-set-item-small"
      style={{ width: 300 }}
      cover={<img alt={props.set.name} src={props.set.imgUrl} />}
      actions={[
        <Button
          key="subscribe"
          type="primary"
          className="is-uppercase"
          size="large"
          icon={<AimOutlined />}
          loading={isLoading}
          onClick={() => {
            handleInteract(isSubscribed, setIsSubscribed, InteractionSubscribe)
          }}
        >
          {i18n(isSubscribed ? "common_unsubscribe" : "common_subscribe")}
        </Button>,
        <Space key="interactions" size="large">
          <Button
            type="text"
            shape="circle"
            size="large"
            onClick={() => {
              handleInteract(isLiked, setIsLiked, InteractionLike)
              !isLiked && isDisliked && undoInteract(setIsDisliked, InteractionDislike)
            }}
            icon={<LikeFilled style={{ color: isLiked ? ColorPrimary : "grey" }} />}
          />
          <Button
            type="text"
            shape="circle"
            size="large"
            onClick={() => {
              handleInteract(isDisliked, setIsDisliked, InteractionDislike)
              !isDisliked && isLiked && undoInteract(setIsLiked, InteractionLike)
            }}
            icon={<DislikeFilled style={{ color: isDisliked ? ColorPrimary : "grey" }} />}
          />
        </Space>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar src={props.set.creatorImageUrl} icon={<UserOutlined />} />}
        title={
          <Link className="page-header--title" to={`/set-detail/${props.set._id}`} title={props.set.name}>
            {props.set.name}
          </Link>
        }
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
